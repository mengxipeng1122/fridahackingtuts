#!/usr/bin/env python
# -*- coding: utf-8 -*-

# this python script try to compile c source code to a object file and output for using of frida
# only support 32bit, ARM/thumb so far

import os
import math
import lief
import argparse
from jinja2 import Template

##################################################
# get a aligned address 
def getAlignNum(addr, align=0x10, shrink=False):
    if shrink:
        addr1 = int( math.floor(addr/align) *align)
        return addr1
    else:
        addr1 = int( math.ceil(addr/align) *align)
        return addr1


def main():
    parser = argparse.ArgumentParser(description="A utility for convert a so to a typescript module ")
    parser.add_argument("input", type=str)
    parser.add_argument('-o', '--output', default='/tmp/tt.ts')
    #parser.add_argument('-t', '--type',choices=['thumb', 'arm', 'arm64'], default='thumb')
    args = parser.parse_args()
    moudle_path = os.path.dirname(os.path.abspath(__file__))
    templateFn = os.path.join(moudle_path, 'so2tsmodule.jinjia')
    ##################################################
    # extract info from so file 
    binary = lief.parse(open(args.input,'rb'))
    # machine_type
    machine_type = binary.header.machine_type.name
    # loads
    name = os.path.basename(args.input);
    loads= []
    load_size = 0;
    for k, seg in enumerate(binary.segments):
        if seg.type == lief.ELF.SEGMENT_TYPES.LOAD:
            virtual_address = seg.virtual_address;
            virtual_size    = seg.virtual_size;
            alignment       = seg.alignment;
            file_offset     = seg.file_offset;
            size            = len(seg.content);
            content         = list(seg.content);
            l ={
                'virtual_address'   : virtual_address , 
                'virtual_size'      : virtual_size    ,
                'alignment'         : alignment       ,
                'file_offset'       : file_offset     ,
                'size'              : size            ,
                'content'           : content         ,
                }
            loads.append(l)
            sz = getAlignNum(virtual_address+virtual_size, alignment)
            load_size = max(sz, load_size)
    # exported_symbols
    exported_symbols = []
    for k, func in enumerate(binary.exported_functions):
        exported_symbols.append({
            'name'      : func.name,
            'address'   : func.address,
            });
    for k, sym in enumerate(binary.exported_symbols):
        if not sym.exported: continue
        exported_symbols.append({
            'name'      : sym.name,
            'address'   : sym.value,
            });
    # relocations
    relocations=[];
    for k, rel in enumerate(binary.relocations):
        relocations.append({
            'address'   : rel.address,
            'addend'    : rel.addend,
            'size'      : rel.size,
            'sym_name'  : rel.symbol.name,
            'type'      : rel.type,
        })
    # write output file
    t = Template(open(templateFn).read())
    s = t.render(
        info = {
        'machine_type'      : machine_type      ,
        'name'              : name              ,
        'loads'             : loads             ,
        'load_size'         : load_size         ,
        'exported_symbols'  : exported_symbols  ,
        'relocations'       : relocations       ,
    });
    open(args.output,'w').write(s)

if __name__ == '__main__':
    main()

