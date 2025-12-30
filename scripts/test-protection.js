// scripts/test-protection.js
const testCases = [
  {
    name: 'Samsung Galaxy',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    tests: [
      'Power + Volume Down',
      'Palm swipe to capture',
      'Smart Capture toolbar',
      '3-finger swipe down'
    ]
  },
  {
    name: 'iPhone iOS',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    tests: [
      'Side button + Volume Up',
      '3-finger up (screenshot editor)',
      'Back tap (if enabled)'
    ]
  },
  {
    name: 'Xiaomi/Redmi',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; 2201116SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    tests: [
      '3-finger long swipe',
      'Quick ball screenshot',
      'Three-finger swipe down'
    ]
  },
  {
    name: 'Google Pixel',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    tests: [
      'Power + Volume Down',
      '3-finger screenshot'
    ]
  },
  {
    name: 'OPPO/Realme',
    userAgent: 'Mozilla/5.0 (Linux; Android 13; CPH2387) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    tests: [
      '3-finger swipe',
      'Three-finger long press'
    ]
  }
];

console.log('📱 Mobile Screenshot Protection Test Suite');
console.log('===========================================\n');

testCases.forEach((device, index) => {
  console.log(`${index + 1}. ${device.name}`);
  console.log(`   User Agent: ${device.userAgent.substring(0, 60)}...`);
  console.log(`   Tests to run:`);
  device.tests.forEach(test => {
    console.log(`     ✓ ${test}`);
  });
  console.log('');
});
