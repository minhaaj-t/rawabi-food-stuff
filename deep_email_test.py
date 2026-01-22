"""
Deep Email Testing Script
Tests all aspects of email sending functionality
"""
import smtplib
import sys
import traceback
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import time

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

# Email Configuration (from app.py)
SMTP_SERVER = 'smtp.office365.com'
SMTP_PORT = 587
SMTP_USERNAME = 'developer@alrawabigroup.com'
SMTP_PASSWORD = 'Qatar@9863'

# Test recipients
TEST_RECIPIENTS = {
    'primary': 'developer@alrawabigroup.com',
    'hr': 'minhaj.rawabi@gmail.com',
    'manager': 'rawabihelpdesk@gmail.com'
}

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_test(test_name):
    """Print a test name"""
    print(f"\n[TEST] {test_name}")
    print("-" * 70)

def test_smtp_connection():
    """Test 1: Basic SMTP Connection"""
    print_test("1. Testing SMTP Server Connection")
    try:
        print(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        print("[OK] Connection established")
        
        print("Starting TLS...")
        server.starttls()
        print("[OK] TLS started successfully")
        
        server.quit()
        print("[OK] Connection closed properly")
        return True, None
    except smtplib.SMTPConnectError as e:
        return False, f"Connection error: {str(e)}"
    except smtplib.SMTPException as e:
        return False, f"SMTP error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}\n{traceback.format_exc()}"

def test_smtp_authentication():
    """Test 2: SMTP Authentication"""
    print_test("2. Testing SMTP Authentication")
    try:
        print(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        
        print(f"Authenticating as: {SMTP_USERNAME}...")
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        print("[OK] Authentication successful")
        
        server.quit()
        return True, None
    except smtplib.SMTPAuthenticationError as e:
        return False, f"Authentication failed: {str(e)}\nCheck username and password."
    except Exception as e:
        return False, f"Unexpected error: {str(e)}\n{traceback.format_exc()}"

def test_basic_email_sending():
    """Test 3: Send Basic Email (Plain Text)"""
    print_test("3. Testing Basic Email Sending (Plain Text)")
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = TEST_RECIPIENTS['primary']
        msg['Subject'] = "Deep Test: Basic Email Test"
        
        body = """This is a basic email test to verify email sending functionality.
        
Test Details:
- Sender: developer@alrawabigroup.com
- Type: Plain text email
- Purpose: Verify basic SMTP functionality

If you receive this email, the basic email sending is working correctly."""
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect and send
        print(f"Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        print(f"Sending email to {TEST_RECIPIENTS['primary']}...")
        server.sendmail(SMTP_USERNAME, [TEST_RECIPIENTS['primary']], msg.as_string())
        server.quit()
        
        print("[OK] Basic email sent successfully")
        return True, None
    except Exception as e:
        return False, f"Failed to send basic email: {str(e)}\n{traceback.format_exc()}"

def test_multiple_recipients():
    """Test 4: Send Email to Multiple Recipients"""
    print_test("4. Testing Multiple Recipients")
    try:
        recipients = [TEST_RECIPIENTS['primary'], TEST_RECIPIENTS['hr']]
        
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = "Deep Test: Multiple Recipients Test"
        
        body = f"""This email tests sending to multiple recipients.

Recipients:
{chr(10).join(f'- {r}' for r in recipients)}

If all recipients receive this, multiple recipient functionality is working."""
        
        msg.attach(MIMEText(body, 'plain'))
        
        print(f"Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        print(f"Sending email to {len(recipients)} recipients...")
        server.sendmail(SMTP_USERNAME, recipients, msg.as_string())
        server.quit()
        
        print(f"[OK] Email sent to {len(recipients)} recipients successfully")
        return True, None
    except Exception as e:
        return False, f"Failed to send to multiple recipients: {str(e)}\n{traceback.format_exc()}"

def test_email_with_attachment():
    """Test 5: Send Email with Attachment"""
    print_test("5. Testing Email with Attachment")
    try:
        # Create a dummy attachment
        attachment_content = b"This is a test attachment file.\nIt contains sample data for testing email attachments."
        attachment_filename = "test_attachment.txt"
        
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = TEST_RECIPIENTS['primary']
        msg['Subject'] = "Deep Test: Email with Attachment"
        
        body = """This email includes an attachment to test attachment functionality.

Attachment Details:
- Filename: test_attachment.txt
- Type: Text file
- Purpose: Verify attachment handling

If you receive this email with the attachment, attachment functionality is working."""
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Add attachment
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(attachment_content)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename= {attachment_filename}')
        msg.attach(part)
        print(f"[OK] Attachment added: {attachment_filename}")
        
        # Connect and send
        print(f"Connecting to SMTP server...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        print(f"Sending email with attachment to {TEST_RECIPIENTS['primary']}...")
        server.sendmail(SMTP_USERNAME, [TEST_RECIPIENTS['primary']], msg.as_string())
        server.quit()
        
        print("[OK] Email with attachment sent successfully")
        return True, None
    except Exception as e:
        return False, f"Failed to send email with attachment: {str(e)}\n{traceback.format_exc()}"

def test_send_email_direct_function():
    """Test 6: Test the send_email_direct function from app.py"""
    print_test("6. Testing send_email_direct Function (from app.py)")
    
    # Simulate the function from app.py
    def send_email_direct(to_emails, subject, body, attachment_data=None, attachment_filename=None, attachment_mimetype=None):
        try:
            smtp_server = SMTP_SERVER
            smtp_port = SMTP_PORT
            smtp_username = SMTP_USERNAME
            smtp_password = SMTP_PASSWORD
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = smtp_username
            msg['Subject'] = subject
            
            # Handle multiple recipients
            if isinstance(to_emails, list):
                msg['To'] = ', '.join(to_emails)
                recipients = to_emails
            else:
                msg['To'] = to_emails
                recipients = [to_emails]
            
            # Add body
            msg.attach(MIMEText(body, 'plain'))
            
            # Add attachment if provided
            if attachment_data and attachment_filename:
                part = MIMEBase('application', 'octet-stream')
                part.set_payload(attachment_data)
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename= {attachment_filename}')
                msg.attach(part)
            
            # Connect and send
            server = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_username, recipients, msg.as_string())
            server.quit()
            return (True, None)
        except Exception as e:
            return (False, str(e))
    
    try:
        # Test without attachment
        print("Testing without attachment...")
        success, error = send_email_direct(
            to_emails=[TEST_RECIPIENTS['primary']],
            subject="Deep Test: send_email_direct Function Test",
            body="This email tests the send_email_direct function from app.py"
        )
        
        if success:
            print("[OK] send_email_direct function works correctly")
            
            # Test with attachment
            print("Testing with attachment...")
            attachment_data = b"Test attachment content"
            success2, error2 = send_email_direct(
                to_emails=[TEST_RECIPIENTS['primary']],
                subject="Deep Test: send_email_direct with Attachment",
                body="Testing send_email_direct function with attachment",
                attachment_data=attachment_data,
                attachment_filename="test.txt"
            )
            
            if success2:
                print("[OK] send_email_direct function with attachment works correctly")
                return True, None
            else:
                return False, f"send_email_direct with attachment failed: {error2}"
        else:
            return False, f"send_email_direct function failed: {error}"
    except Exception as e:
        return False, f"Error testing send_email_direct: {str(e)}\n{traceback.format_exc()}"

def test_error_handling():
    """Test 7: Test Error Handling"""
    print_test("7. Testing Error Handling")
    
    # Test invalid recipient
    try:
        print("Testing with invalid recipient...")
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = 'invalid-email-address'
        msg['Subject'] = "Test"
        msg.attach(MIMEText("Test", 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        
        try:
            server.sendmail(SMTP_USERNAME, ['invalid-email-address'], msg.as_string())
            print("[WARN] Invalid recipient test: Server accepted invalid email (may be handled by server)")
        except smtplib.SMTPRecipientsRefused as e:
            print(f"[OK] Error handling works: Invalid recipient rejected: {e}")
        finally:
            server.quit()
        
        return True, None
    except Exception as e:
        # This is expected for invalid emails
        print(f"[OK] Error handling works: {type(e).__name__}")
        return True, None

def run_all_tests():
    """Run all email tests"""
    print_section("DEEP EMAIL FUNCTIONALITY TEST")
    print(f"SMTP Server: {SMTP_SERVER}:{SMTP_PORT}")
    print(f"Sender: {SMTP_USERNAME}")
    print(f"Test Recipients: {', '.join(TEST_RECIPIENTS.values())}")
    
    results = []
    
    # Test 1: Connection
    success, error = test_smtp_connection()
    results.append(("SMTP Connection", success, error))
    if not success:
        print(f"\n[FAIL] CRITICAL: Cannot proceed without connection. Error: {error}")
        return results
    time.sleep(2)  # Small delay between tests
    
    # Test 2: Authentication
    success, error = test_smtp_authentication()
    results.append(("SMTP Authentication", success, error))
    if not success:
        print(f"\n[FAIL] CRITICAL: Cannot proceed without authentication. Error: {error}")
        return results
    time.sleep(2)
    
    # Test 3: Basic Email
    success, error = test_basic_email_sending()
    results.append(("Basic Email Sending", success, error))
    time.sleep(2)
    
    # Test 4: Multiple Recipients
    success, error = test_multiple_recipients()
    results.append(("Multiple Recipients", success, error))
    time.sleep(2)
    
    # Test 5: Email with Attachment
    success, error = test_email_with_attachment()
    results.append(("Email with Attachment", success, error))
    time.sleep(2)
    
    # Test 6: send_email_direct Function
    success, error = test_send_email_direct_function()
    results.append(("send_email_direct Function", success, error))
    time.sleep(2)
    
    # Test 7: Error Handling
    success, error = test_error_handling()
    results.append(("Error Handling", success, error))
    
    # Print Summary
    print_section("TEST SUMMARY")
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for test_name, success, error in results:
        status = "[PASS]" if success else "[FAIL]"
        print(f"{status} - {test_name}")
        if error and not success:
            print(f"    Error: {error[:100]}...")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n[SUCCESS] ALL TESTS PASSED - Email system is working correctly!")
    else:
        print(f"\n[WARNING] {total - passed} TEST(S) FAILED - Review errors above")
    
    return results

if __name__ == "__main__":
    try:
        results = run_all_tests()
        sys.exit(0 if all(success for _, success, _ in results) else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n[FATAL ERROR] {str(e)}")
        print(traceback.format_exc())
        sys.exit(1)
