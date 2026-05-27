import os
from PIL import Image

src_path = r"C:\Users\Gaming\.gemini\antigravity-ide\brain\34ceb7f3-f058-4ffc-8f30-931c1a2328bd\clinicos_logo_1779710404887.png"
dest_192 = r"E:\Project\Clinic System\public\icon-192x192.png"
dest_512 = r"E:\Project\Clinic System\public\icon-512x512.png"

try:
    img = Image.open(src_path)
    # Resize to 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(dest_192, "PNG")
    print("Saved 192x192 icon to:", dest_192)

    # Resize to 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(dest_512, "PNG")
    print("Saved 512x512 icon to:", dest_512)
    print("SUCCESS")
except Exception as e:
    print("Error:", e)
