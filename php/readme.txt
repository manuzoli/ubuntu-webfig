#wrapper.c is my API for root access
- change wrapper.c
#compile
gcc wrapper.c -o php_root
#set rights
chmod u=rwx,go=xr,+s php_root