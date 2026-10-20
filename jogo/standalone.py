import sys
# uso: standalone.py jogo.html destino.html [/api]: o terceiro argumento liga o modo online (ranking, login, diamantes)
src,dst=sys.argv[1],sys.argv[2]
api=sys.argv[3] if len(sys.argv)>3 else None
body=open(src).read()
title_end=body.index('</title>')+len('</title>')
head_extra='''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Caderninho">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#F3F7FD">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" href="/favicon.ico" sizes="any">
'''
reset=(f'<script>window.CM_API={api!r}</script>\n' if api else '')+'<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
# the page's own <head> part (title, metas, links, style) stays in <head>; the markup and script go to <body>
style_end=body.index('</style>')+len('</style>')
out=head_extra+body[:style_end]+'\n'+reset+'</head>\n<body>\n'+body[style_end:]+'\n</body>\n</html>\n'
open(dst,'w').write(out)
print('ok')
