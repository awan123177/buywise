import re

with open('server.ts', 'r') as f:
    text = f.read()

# I see lines like: email, = decodedToken.email, || email,;
text = re.sub(r'email, =', 'email =', text)
text = re.sub(r'email, \|\| email,', 'email || email', text)

with open('server.ts', 'w') as f:
    f.write(text)
