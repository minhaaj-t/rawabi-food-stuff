"""
Test email functionality using Flask app context
"""
import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, send_email_direct

def test_email_with_app_context():
    """Test email sending using Flask app context"""
    print("="*70)
    print("TESTING EMAIL FUNCTIONALITY WITH FLASK APP CONTEXT")
    print("="*70)
    
    with app.app_context():
        # Test 1: Basic email
        print("\n[TEST 1] Basic Email Sending")
        print("-"*70)
        success, error = send_email_direct(
            to_emails=['developer@alrawabigroup.com'],
            subject="Test: Flask App Email Function",
            body="This is a test email sent using the Flask app context."
        )
        if success:
            print("[PASS] Basic email sent successfully")
        else:
            print(f"[FAIL] Basic email failed: {error}")
            return False
        
        # Test 2: Multiple recipients
        print("\n[TEST 2] Multiple Recipients")
        print("-"*70)
        success, error = send_email_direct(
            to_emails=['developer@alrawabigroup.com', 'minhaj.rawabi@gmail.com'],
            subject="Test: Multiple Recipients",
            body="This email tests multiple recipients functionality."
        )
        if success:
            print("[PASS] Multiple recipients email sent successfully")
        else:
            print(f"[FAIL] Multiple recipients failed: {error}")
            return False
        
        # Test 3: Email with attachment
        print("\n[TEST 3] Email with Attachment")
        print("-"*70)
        attachment_data = b"This is a test attachment file.\nIt contains sample data."
        success, error = send_email_direct(
            to_emails=['developer@alrawabigroup.com'],
            subject="Test: Email with Attachment",
            body="This email includes an attachment.",
            attachment_data=attachment_data,
            attachment_filename="test_attachment.txt",
            attachment_mimetype="text/plain"
        )
        if success:
            print("[PASS] Email with attachment sent successfully")
        else:
            print(f"[FAIL] Email with attachment failed: {error}")
            return False
        
        # Test 4: Error handling - invalid email
        print("\n[TEST 4] Error Handling - Invalid Email")
        print("-"*70)
        success, error = send_email_direct(
            to_emails=['invalid-email'],
            subject="Test",
            body="Test"
        )
        if not success:
            print(f"[PASS] Invalid email correctly rejected: {error}")
        else:
            print("[FAIL] Invalid email was accepted (unexpected)")
            return False
        
        # Test 5: Error handling - missing subject
        print("\n[TEST 5] Error Handling - Missing Subject")
        print("-"*70)
        success, error = send_email_direct(
            to_emails=['developer@alrawabigroup.com'],
            subject="",
            body="Test"
        )
        if not success:
            print(f"[PASS] Missing subject correctly rejected: {error}")
        else:
            print("[FAIL] Missing subject was accepted (unexpected)")
            return False
        
        print("\n" + "="*70)
        print("[SUCCESS] ALL TESTS PASSED!")
        print("="*70)
        return True

if __name__ == "__main__":
    try:
        success = test_email_with_app_context()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[FATAL ERROR] {str(e)}")
        import traceback
        print(traceback.format_exc())
        sys.exit(1)
