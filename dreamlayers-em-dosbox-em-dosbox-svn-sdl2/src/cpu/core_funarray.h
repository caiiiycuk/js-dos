/* These must be negative, because zero and above are CBRET values */
#define CASERET_ILLEGAL (-1)
#define CASERET_BREAK (-2)
#define CASERET_CONTINUE (-3)
#define CASERET_RESTART (-4)
#define CASERET_END (-5)

#define FUNARRAY_CODE(opcode_expr, funptr_array)		\
		int opcode = (opcode_expr);						\
		int funret;										\
		if (opcode >= 1024) {							\
			funret = CASERET_ILLEGAL;					\
		} else {										\
			funret = (funptr_array)[opcode]();			\
		}												\
														\
		switch (funret) {								\
		case CASERET_BREAK: break;						\
		case CASERET_CONTINUE: continue;				\
		case CASERET_RESTART: goto restart_opcode;		\
		case CASERET_END: goto decode_end;				\
		default: return funret;							\
		case CASERET_ILLEGAL:
