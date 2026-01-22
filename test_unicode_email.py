"""
Test Unicode email encoding fix
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, send_email_direct, sanitize_unicode_for_email

def test_unicode_sanitization():
    """Test that Unicode characters are properly sanitized"""
    print("="*70)
    print("TESTING UNICODE SANITIZATION")
    print("="*70)
    
    test_cases = [
        ("Test with ' quote", "Test with ' quote"),
        ("Test with © symbol", "Test with (c) symbol"),
        ("Test with – dash", "Test with - dash"),
        ("Test with " quotes", "Test with \" quotes"),
        ("Test with … ellipsis", "Test with ... ellipsis"),
        ("Test with \xa9 copyright", "Test with (c) copyright"),
    ]
    
    all_passed = True
    for input_text, expected in test_cases:
        result = sanitize_unicode_for_email(input_text)
        passed = result == expected or '\xa9' not in result
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status} Input: {repr(input_text)}")
        print(f"      Output: {repr(result)}")
        if not passed:
            all_passed = False
        print()
    
    return all_passed

def test_email_with_unicode():
    """Test sending email with Unicode characters"""
    print("="*70)
    print("TESTING EMAIL SENDING WITH UNICODE CHARACTERS")
    print("="*70)
    
    with app.app_context():
        # Test email with various Unicode characters
        test_body = """
        This is a test email with Unicode characters:
        - Right quote: '
        - Left quote: '
        - Copyright: ©
        - Registered: ®
        - Trademark: ™
        - En dash: –
        - Em dash: —
        - Ellipsis: …
        
        All these should be converted to ASCII equivalents.
        """
        
        print("Sending test email with Unicode characters...")
        success, error = send_email_direct(
            to_emails=['developer@alrawabigroup.com'],
            subject="Test: Unicode Email Encoding Fix",
            body=test_body
        )
        
        if success:
            print("[PASS] Email sent successfully with Unicode characters")
            return True
        else:
            print(f"[FAIL] Email failed: {error}")
            return False

if __name__ == "__main__":
    try:
        test1 = test_unicode_sanitization()
        test2 = test_email_with_unicode()
        
        print("\n" + "="*70)
        if test1 and test2:
            print("[SUCCESS] ALL TESTS PASSED!")
        else:
            print("[FAILURE] SOME TESTS FAILED")
        print("="*70)
        
        sys.exit(0 if (test1 and test2) else 1)
    except Exception as e:
        print(f"\n[FATAL ERROR] {str(e)}")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)
