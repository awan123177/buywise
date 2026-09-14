import re

with open('server.ts', 'r') as f:
    text = f.read()

# Replace all occurrences of "email\n\s*full_name:" with "email,\nfull_name:"
text = re.sub(r'email\s*\n\s*full_name:', 'email,\n        full_name:', text)

with open('server.ts', 'w') as f:
    f.write(text)
