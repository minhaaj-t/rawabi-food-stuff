# Email Display Name Configuration

## Change Made
Updated the email sender display name to show "Rawabi Food Stuff - HR" instead of just the email address.

## Implementation

**Before:**
```python
msg['From'] = smtp_username
# Result: developer@alrawabigroup.com
```

**After:**
```python
display_name = "Rawabi Food Stuff - HR"
msg['From'] = Header(f'{display_name} <{smtp_username}>', 'utf-8')
# Result: Rawabi Food Stuff - HR <developer@alrawabigroup.com>
```

## Result

All emails sent from the application will now display:
- **Display Name:** Rawabi Food Stuff - HR
- **Email Address:** developer@alrawabigroup.com

This makes emails more professional and recognizable to recipients, clearly identifying them as coming from the HR department of Rawabi Food Stuff.

## Files Modified

- **app.py** - Updated `send_email_direct()` function to include display name in From header

## Email Client Display

In email clients (Gmail, Outlook, etc.), recipients will see:
```
From: Rawabi Food Stuff - HR <developer@alrawabigroup.com>
```

Instead of just:
```
From: developer@alrawabigroup.com
```
