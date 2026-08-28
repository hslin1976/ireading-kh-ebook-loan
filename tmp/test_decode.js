const fs = require('fs');
const iconv = require('iconv-lite');

// Let's write out the raw string from prompt and analyze
const sample = `114,114005,U^ӫe100I,9789579077767,2020/01/07,pI,fΥ@l,,LyX,ռ,1
114,114004,ĨFI,9789865357078,2021/05,daШƷ~ѥq,p,˹T,,ռ,1
114,114003,ڷݷ,9786267295359,2025/05/01,LƨƷ~ѥq,wF,,wF,ռ,1
114,114002, o˰SSYI,9789575214524,2021/3/1,FB,D(Beth Bracken),zdDإ(Richard Watson),dв[,ռ,1`;

console.log("Sample length:", sample.length);

// Also let's search online or web search with the ISBNs to get the exact Kaohsiung Happy Reading list (高雄喜閱網) or decode!
// For example:
// ISBN 9789579077767 -> 媽媽買綠豆? or 恐龍掉下來前100秒? Let's check!
