import os, re, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
D = HERE + '/src/'
h = open(D + '1-head.html').read()
js = ''.join(open(D + f).read() + '\n' for f in ['2-chars.js', '3-helpers.js', '4-worlds1.js', '5-gen.js', '6-grades.js', '6b-celebrate.js','6c-bonus.js','6d-rewards.js','6e-shop.js'])
app = open(D + '7-app.js').read()

# ---------- legacy CSS (iOS 12 Safari): fallbacks that modern browsers simply override ----------
def mix_fallback(m):
    a, p, b = m.group(1).strip(), int(m.group(2)), m.group(3).strip()
    if b == 'transparent' and a == 'var(--ok)':
        return 'rgba(34,168,103,%.2f)' % (p / 100)
    if b == 'var(--card)':
        return '#EEF3FA' if p <= 25 else a
    return a

def fallback_value(v):
    v = re.sub(r'clamp\(([^,()]+(?:\([^()]*\))?[^,()]*),([^,()]+(?:\([^()]*\))?[^,()]*),([^()]+(?:\([^()]*\))?[^()]*)\)', lambda m: m.group(3).strip(), v)
    v = re.sub(r'color-mix\(in srgb,\s*([^%]+?)\s+(\d+)%\s*,\s*((?:var\([^)]*\)|[^)])+?)\s*\)', mix_fallback, v)
    return v

def expand_inset(m):
    parts = m.group(1).split()
    t, r, b, l = (parts * 4)[:4] if len(parts) == 1 else (parts + [parts[0]] * 4)[:4]
    if len(parts) == 2: t, r, b, l = parts[0], parts[1], parts[0], parts[1]
    if len(parts) == 3: t, r, b, l = parts[0], parts[1], parts[2], parts[1]
    if len(parts) == 4: t, r, b, l = parts
    return 'top:%s;right:%s;bottom:%s;left:%s' % (t, r, b, l)

def legacy_css(css):
    css = re.sub(r'(?<![-\w])inset:([^;}]+)', expand_inset, css)
    def decl(m):
        prop, val = m.group(1), m.group(2)
        out = ''
        if 'clamp(' in val or 'color-mix(' in val:
            out += '%s:%s;' % (prop, fallback_value(val))
        if prop == 'clip-path':
            out += '-webkit-clip-path:%s;' % val
        return out + '%s:%s' % (prop, val)
    css = re.sub(r'(?<=[{;\s])([a-z-]+):((?:[^;{}()]|\((?:[^()]|\([^()]*\))*\))+)(?=[;}])', decl, css)
    gaps = {'.chips,.chiprow,.headtools,.bag,.seq,.recrow': '4px', '.rrow': '6px', '.maphead,.goal': '7px', '.whead,.topbar,.groups,.pairs,.row,.listnums': '5px',
            '.dots,.rods,.cubes,.pat': '3px', '.visual': '7px', '.pv': '11px', '.btnrow,.mghead': '6px', '.choice': '4px', '.eq': '.15em', '.tdots,.trow': '2px', '.ss-hands': '30px', '.dob,.exbtns,.kstats': '4px', '.bars': '1px'}
    extra = '\n/* flexbox gap is missing on iOS 12: margins instead (html.nogap set by a feature test) */\n'
    for sel, g in gaps.items():
        extra += ','.join('.nogap %s>*' % s for s in sel.split(',')) + '{margin:%s}\n' % g
    extra += '@supports not (aspect-ratio:1/1){.mhole{height:110px}.mcard{height:140px}}\n'
    return css.replace('</style>', extra + '</style>') if '</style>' in css else css + extra

head, rest = h.split('<style>', 1)
style, after = rest.split('</style>', 1)
h = head + '<style>' + legacy_css(style + '</style>') + after

GAPTEST = "(function(){try{var d=document.createElement('div');d.style.cssText='display:flex;flex-direction:column;row-gap:1px;position:absolute;visibility:hidden';d.appendChild(document.createElement('div'));d.appendChild(document.createElement('div'));document.documentElement.appendChild(d);if(d.scrollHeight!==1)document.documentElement.className+=' nogap';d.parentNode.removeChild(d)}catch(e){}})();\n"
src = '(function(){\n' + js + app.replace('})();\n</script>', '})();\n').rstrip()
if src.endswith('</script>'):
    src = src[:-len('</script>')]
# esbuild baixa o JavaScript para o Safari do iOS 12 (iPad antigo)
tmp = tempfile.mkdtemp()
open(tmp + '/in.js', 'w').write(src)
esbuild = os.path.join(HERE, '..', 'node_modules', '.bin', 'esbuild')
subprocess.run([esbuild, tmp + '/in.js', '--target=safari12', '--charset=utf8', '--outfile=' + tmp + '/out.js', '--log-level=warning'], check=True)
outjs = open(tmp + '/out.js').read()
html = h + '\n<script>\n' + GAPTEST + outjs + '\n</script>\n'
open(HERE + '/caderninho-magico.html', 'w').write(html)
print('ok', len(html) // 1024, 'KB')
