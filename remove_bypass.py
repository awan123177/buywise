import re
with open('server.ts', 'r') as f:
    text = f.read()

text = re.sub(r'  // Direct Plan Activation Endpoint.*?  // Get or Create User Profile', '  // Get or Create User Profile', text, flags=re.DOTALL)

with open('server.ts', 'w') as f:
    f.write(text)
