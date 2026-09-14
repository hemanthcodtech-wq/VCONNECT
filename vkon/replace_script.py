import os
import re

directories = ["/Users/hemanthkancharla/Documents/zewotech/UP/UPTRADERS/src", "/Users/hemanthkancharla/Documents/zewotech/UP/UPBE"]

replacements = [
    (re.compile(r"Manikanta Super Market", re.IGNORECASE), "UP Traders"),
    (re.compile(r"manikantasupermarket\.com", re.IGNORECASE), "upraders.com"),
    (re.compile(r"manikantasupermarket\.in", re.IGNORECASE), "upraders.in"),
    (re.compile(r"Manikanta", re.IGNORECASE), "UP Traders"),
]

for directory in directories:
    for root, _, files in os.walk(directory):
        if "node_modules" in root or ".git" in root or "dist" in root:
            continue
        for file in files:
            if not (file.endswith(".js") or file.endswith(".jsx") or file.endswith(".ts") or file.endswith(".tsx") or file.endswith(".html") or file.endswith(".json")):
                continue
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, repl in replacements:
                    new_content = pattern.sub(repl, new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated: {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

