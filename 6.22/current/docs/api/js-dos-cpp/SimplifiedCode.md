



#Simplified Code

js-dos-cpp contains simplified code of dosbox, produced by applying unifdef with
this args:

```
unifdef -DGET_X86_FUNCTIONS \
-DHAVE_CONFIG_H \
-DJSDOS \
-USDL_VERSION_2 \
-UC_OPENGL \
-UWIN32 \
-UMACOSX \
-UOS2 \
-UC_SET_PRIORITY \
-UWORDS_BIGENDIAN \
-U0 \
-DC_SDLGFX \
-DSDL_BYTEORDER=1234 \
-kM .orig \
file.cpp
```





