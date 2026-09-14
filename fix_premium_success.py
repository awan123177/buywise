import re

with open('src/components/PremiumSuccess.tsx', 'r') as f:
    text = f.read()

replacement = """  useEffect(() => {
    if (status === 'success') {
       refreshPremium();
    }
  }, [status]);"""

text = re.sub(r"  const hasVerified = useRef\(false\);", "  const hasVerified = useRef(false);\n\n" + replacement, text)

with open('src/components/PremiumSuccess.tsx', 'w') as f:
    f.write(text)
