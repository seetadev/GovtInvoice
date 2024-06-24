import commands
import sys
import json

wbookenc = commands.getoutput("php import.php %s"%sys.argv[1])



i = wbookenc.index("$---$")


wbookenc = wbookenc[i+5:]

#print wbookenc

wbook = json.loads(wbookenc)

#print wbook['numsheets'],wbook['currentname'],wbook['currentid']

f = open("testsc.txt","w")
f.write(wbookenc)
f.close()
