# Corta as imagens geradas por gerar.mjs nos tamanhos que o site usa (precisa do Pillow).
import os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'public') + '/'
src = Image.open(HERE + '/icone-1024.png').convert('RGB')
for name, s in [('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512), ('favicon-32.png', 32)]:
    src.resize((s, s), Image.LANCZOS).save(OUT + name, optimize=True)
src.resize((64, 64), Image.LANCZOS).save(OUT + 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
Image.open(HERE + '/icone-maskable-1024.png').convert('RGB').resize((512, 512), Image.LANCZOS).save(OUT + 'icon-maskable-512.png', optimize=True)
print('ok')
