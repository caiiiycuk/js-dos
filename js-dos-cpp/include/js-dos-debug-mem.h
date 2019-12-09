//
// Created by caiiiycuk on 09.12.2019.
//

#ifndef JS_DOS_JS_DOS_DEBUG_MEM_H
#define JS_DOS_JS_DOS_DEBUG_MEM_H

typedef int (*SearchFunc)(Bit8u lhs, Bit8u rhs, Bit8u val);

// Mem Search Set
void MSR_Set(Bit8u val);
// Mem Search Execute
void MSR_Execute();
// Mem Show
void MSR_Show();

void InitSearch(Bitu seg, Bitu ofs1, Bit32u num);

void DoSearch(SearchFunc op, Bit8u val);

int SearchFnEq(Bit8u lhs, Bit8u rhs, Bit8u val);

int SearchFnNe(Bit8u lhs, Bit8u rhs, Bit8u val);

int SearchFnLt(Bit8u lhs, Bit8u rhs, Bit8u val);

int SearchFnGt(Bit8u lhs, Bit8u rhs, Bit8u val);

int SearchFnEqVal(Bit8u lhs, Bit8u rhs, Bit8u val);

#endif //JS_DOS_JS_DOS_DEBUG_MEM_H
