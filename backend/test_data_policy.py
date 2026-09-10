"""Testes da política de dados: mocks existem apenas neste arquivo de teste."""
from __future__ import annotations

import math
import unittest
from unittest.mock import Mock, patch

import main
import public_data_service as data
import speech_service
from models import GameScoreRequest, SimulateRequest


def observed_payload():
    return {
        "osm": {
            "competitors": [],
            "competitor_count": 2,
            "competitor_density": 1.5,
            "infrastructure": {},
            "infrastructure_count": 4,
            "transport_count": 3,
            "osm_element_count": 9,
        },
        "ibge": {
            "location": {"city": "São Paulo", "state_code": "SP"},
            "city": {"id": 3550308, "name": "São Paulo", "state": "SP"},
            "gdp": {"value": 1000.0, "year": "2023", "unit": "Mil Reais"},
        },
        "population_area": {
            "value": 1234,
            "year": 2020,
            "resolution": "100 m",
            "area_km2": 7.07,
            "sampled_cells": 10,
        },
        "score": {
            "overall": 42.5,
            "competition": 86.5,
            "infrastructure": 20.0,
            "mobility": 21.0,
        },
        "radius_meters": 1500,
        "sources": [],
        "collected_at": "2026-09-03T12:00:00Z",
    }


class DataPolicyTests(unittest.TestCase):
    def setUp(self):
        data._cache.clear()

    def test_score_is_deterministic_and_derived(self):
        result = data._score(observed_payload()["osm"])
        expected = 86.5 * 0.45 + 20 * 0.30 + 21 * 0.25
        self.assertEqual(result["overall"], round(expected, 1))

    def test_all_40_catalog_items_have_real_osm_filters_and_icons(self):
        self.assertEqual(len(main.BUSINESS_CATALOG), 40)
        self.assertEqual(len({item["id"] for item in main.BUSINESS_CATALOG}), 40)
        for item in main.BUSINESS_CATALOG:
            self.assertTrue(item["icon"])
            self.assertTrue(data._business_filters(item["id"]))

    def test_compound_business_filter_requires_every_osm_tag(self):
        selector = data._business_selector(
            {"amenity": "restaurant|fast_food", "cuisine": "japanese|sushi"},
            1500,
            -23.55,
            -46.63,
        )
        self.assertIn('["amenity"~"^(restaurant|fast_food)$"]', selector)
        self.assertIn('["cuisine"~"^(japanese|sushi)$"]', selector)

    def test_known_municipality_skips_duplicate_reverse_geocoding(self):
        with (
            patch.object(data, "_reverse_location") as reverse,
            patch.object(data, "_latest_aggregate", return_value=None),
        ):
            result = data._query_ibge(-23.55, -46.63, "3550308", "São Paulo", "SP")
        reverse.assert_not_called()
        self.assertEqual(result["city"]["id"], 3550308)

    def test_worldpop_ignores_missing_and_nodata_instead_of_zero_fallback(self):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "samples": [
                {"value": None},
                {"value": 3.4e38},
                {"value": "12.4"},
            ]
        }
        with patch.object(data._session, "post", return_value=response):
            result = data._query_worldpop(-23.55, -46.63, 100)
        self.assertEqual(result["value"], 12)
        self.assertEqual(result["sampled_cells"], 1)

    def test_geocode_links_result_to_ibge_code(self):
        payload = [
            {
                "place_id": 1,
                "display_name": "São Paulo, SP, Brasil",
                "lat": "-23.55",
                "lon": "-46.63",
                "address": {
                    "city": "São Paulo",
                    "ISO3166-2-lvl4": "BR-SP",
                },
            }
        ]
        with (
            patch.object(data, "_nominatim_get", return_value=payload),
            patch.object(data, "_find_ibge_city", return_value={"id": 3550308, "nome": "São Paulo"}),
        ):
            result = data.search_locations("São Paulo")
        self.assertEqual(result[0]["municipality"]["ibge_code"], "3550308")

    def test_reverse_geocode_uses_reverse_endpoint_and_preserves_clicked_point(self):
        payload = {
            "place_id": 2,
            "display_name": "Praça da Sé, São Paulo, SP, Brasil",
            "lat": "-23.5504",
            "lon": "-46.6332",
            "address": {
                "city": "São Paulo",
                "country_code": "br",
                "ISO3166-2-lvl4": "BR-SP",
            },
        }
        with (
            patch.object(data, "_nominatim_get", return_value=payload) as nominatim,
            patch.object(data, "_find_ibge_city", return_value={"id": 3550308, "nome": "São Paulo"}),
        ):
            result = data.reverse_geocode_location(-23.5505, -46.6333)

        self.assertIsNotNone(result)
        self.assertEqual(nominatim.call_args.args[0], "reverse")
        self.assertEqual(result["lat"], -23.5505)
        self.assertEqual(result["lng"], -46.6333)
        self.assertEqual(result["municipality"]["ibge_code"], "3550308")

    def test_simulation_uses_observed_baseline_and_declares_assumptions(self):
        with patch.object(main, "analyze_public_data", return_value=observed_payload()):
            result = main.simulate(
                SimulateRequest(
                    address="Local verificado",
                    business_type="cafeteria",
                    lat=-23.55,
                    lng=-46.63,
                    population_growth=10,
                    income_growth=5,
                    new_competitors=2,
                )
            )
        self.assertEqual(result.original_score, 42.5)
        self.assertEqual(result.assumptions["classification"], "hipóteses do usuário")
        self.assertEqual(len(result.projections), 5)
        self.assertTrue(all(math.isfinite(item.score) for item in result.projections))

    def test_game_score_uses_only_observed_components(self):
        with patch.object(main, "analyze_public_data", return_value=observed_payload()):
            result = main.gamification_score(
                GameScoreRequest(
                    address="Local verificado",
                    business_type="cafeteria",
                    lat=-23.55,
                    lng=-46.63,
                )
            )
        self.assertEqual(result.competition_component, round(86.5 * 4))
        self.assertEqual(result.infrastructure_component, 60)
        self.assertEqual(result.mobility_component, 63)

    def test_speech_has_no_fabricated_transcript(self):
        with patch.object(speech_service, "get_speech_client", return_value=None):
            with self.assertRaises(RuntimeError):
                speech_service.transcribe_audio(b"audio")


if __name__ == "__main__":
    unittest.main()
