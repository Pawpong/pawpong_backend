import unittest
from app.adapters.support import validate_ids


class SupportValidationTest(unittest.TestCase):
    def test_preserves_order_and_deduplicates(self):
        self.assertEqual(validate_ids('{"faq_ids":["1","1"]}', [{"faq_id": "1"}]), ["1"])

    def test_unknown_id_rejected(self):
        with self.assertRaises(ValueError):
            validate_ids('{"faq_ids":["fake"]}', [{"faq_id": "1"}])

    def test_invalid_shapes_rejected(self):
        for value in ['null', '[]', '{}', '{"faq_ids":"1"}', '{"faq_ids":[1]}', 'not-json']:
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate_ids(value, [])

    def test_empty_result_supported(self):
        self.assertEqual(validate_ids('{"faq_ids":[]}', []), [])
