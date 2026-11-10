const {test}=require('node:test');const assert=require('node:assert/strict');const {calculate}=require('../assets/calculator.js');
test('reference scenario: monthly sales of 20,000 gives 4,000–6,000 monthly and 48,000 annually',()=>assert.deepEqual(calculate(20000),{monthlyLow:4000,monthlyHigh:6000,annualLow:48000}));
test('UK slider endpoints preserve the same percentages',()=>{assert.deepEqual(calculate(10000),{monthlyLow:2000,monthlyHigh:3000,annualLow:24000});assert.deepEqual(calculate(200000),{monthlyLow:40000,monthlyHigh:60000,annualLow:480000});});
test('AED calculations use the entered currency amount without a second conversion',()=>assert.deepEqual(calculate(100000),{monthlyLow:20000,monthlyHigh:30000,annualLow:240000}));
test('zero is valid and invalid values do not produce a revenue result',()=>{assert.deepEqual(calculate(0),{monthlyLow:0,monthlyHigh:0,annualLow:0});for(const n of [-1,Infinity,NaN,'bad'])assert.equal(calculate(n),null);});
