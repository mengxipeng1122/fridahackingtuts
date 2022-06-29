
'use strict';


////////////////////////////////////////////////////////////////////////////////
// thumb related 


/**
 * This function do a inline hook with a Thumb function
 * @example
 *
 * @param {NativePointer} trampoline_ptr: address to hold trampoline code
 * @param {NativePointer} hook_ptr: target address to hook
 * @param {NativePointer} hook_fun_ptr: address of the function to handle the hook
 * @param {NativePointer} para1: the first parameter to the hook handle function
 * @param {number[]} origin_inst: original instructions at target address. It's optional.
 * @return {number} : the size of the trampoline code
 */
export function putThumbHookPatch(trampoline_ptr:NativePointer, hook_ptr:NativePointer, hook_fun_ptr:NativePointer, para1:NativePointer, origin_inst?:number[]):number
{
    let trampoline_len = 0x30;
    //console.log(trampoline_ptr)
    Memory.protect(trampoline_ptr, trampoline_len, 'rwx');
trampoline_ptr.add(0x0 ).writeByteArray(([ 0xff, 0xb4 ])); // 0x0:	push	{r0, r1, r2, r3, r4, r5, r6, r7}
trampoline_ptr.add(0x2 ).writeByteArray(([ 0x2d, 0xe9, 0x0, 0x5f ])); // 0x2:	push.w	{r8, sb, sl, fp, ip, lr}
trampoline_ptr.add(0x6 ).writeByteArray(([ 0xef, 0xf3, 0x0, 0x80 ])); // 0x6:	mrs	r0, apsr
trampoline_ptr.add(0xa ).writeByteArray(([ 0x1, 0xb4 ])); // 0xa:	push	{r0}
trampoline_ptr.add(0xc ).writeByteArray(([ 0x0, 0xbf ])); // 0xc:	nop
trampoline_ptr.add(0xe ).writeByteArray(([ 0x69, 0x46 ])); // 0xe:	mov	r1, sp
trampoline_ptr.add(0x10).writeByteArray(([ 0x5, 0x48 ])); // 0x10:	ldr	r0, [pc, #0x14] @ --> 0x28
trampoline_ptr.add(0x12).writeByteArray(([ 0x6, 0x4c ])); // 0x12:	ldr	r4, [pc, #0x18] @ --> 0x2c
trampoline_ptr.add(0x14).writeByteArray(([ 0xa0, 0x47 ])); // 0x14:	blx	r4
trampoline_ptr.add(0x16).writeByteArray(([ 0x1, 0xbc ])); // 0x16:	pop	{r0}
trampoline_ptr.add(0x18).writeByteArray(([ 0x80, 0xf3, 0x0, 0x89 ])); // 0x18:	msr	cpsr_fc, r0
trampoline_ptr.add(0x1c).writeByteArray(([ 0xbd, 0xe8, 0x0, 0x5f ])); // 0x1c:	pop.w	{r8, sb, sl, fp, ip, lr}
trampoline_ptr.add(0x20).writeByteArray(([ 0xff, 0xbc ])); // 0x20:	pop	{r0, r1, r2, r3, r4, r5, r6, r7}
trampoline_ptr.add(0x22).writeByteArray(([ 0x0, 0xbf ])); // 0x22:	nop
trampoline_ptr.add(0x24).writeByteArray(([ 0x0, 0xbf ])); // 0x24:	nop
trampoline_ptr.add(0x26).writeByteArray(([ 0x70, 0x47 ])); // 0x26:	bx	lr
trampoline_ptr.add(0x28).writeByteArray(([ 0x0, 0xbf ])); // 0x28:	nop
trampoline_ptr.add(0x2a).writeByteArray(([ 0x0, 0xbf ])); // 0x2a:	nop
trampoline_ptr.add(0x2c).writeByteArray(([ 0x0, 0xbf ])); // 0x2c:	nop
trampoline_ptr.add(0x2e).writeByteArray(([ 0x0, 0xbf ])); // 0x2e:	nop

    if(origin_inst!=undefined) trampoline_ptr.add(0x22).writeByteArray(origin_inst);
    trampoline_ptr.add(0x28).writePointer(para1)
    trampoline_ptr.add(0x2c).writePointer(hook_fun_ptr)
    {
        let p = ptr((hook_ptr.toUInt32() & (~1))>>>0);
        Memory.patchCode(p, 4, patchaddr => {
            var cw = new ThumbWriter(patchaddr);
            cw.putBlImm(trampoline_ptr) 
            cw.flush();
        });
    }
    return trampoline_len;
}

