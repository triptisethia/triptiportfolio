window.ThelaResearch=(()=>{
const PLAN = {
    road:   ['C.G. Road', 'One of Ahmedabad’s busiest streets runs right alongside the market.'],
    food:   ['the western entrance', 'Flooded with smaller food stalls that come alive in the evening, which makes the market a hangout for every age group.'],
    north:  ['shops · north', 'Part of the ring of 49 small shops around the courtyard.'],
    east:   ['shops · east', 'Part of the ring of 49 small shops around the courtyard.'],
    south:  ['shops · south', 'Part of the ring of 49 small shops around the courtyard.'],
    court:  ['the courtyard', 'Used for parking. On busy days it fills up, and vendors rank the crowding as one of the market’s problems.'],
    temple: ['the temple', 'A tea stall near the temple has been running for about 50 years.']
  };
const THEMES = [
    ['longevity & continuity', [['Bhupendra Shah', 'In the market since 1976; has run ‘Cheers’ since 1980.'], ['Neel, coconut vendor', 'Has been serving customers for about 50 years.'], ['Kuldeep Yadav', 'Has run a tea stall near the temple for around 50 years.']]],
    ['satisfaction', [['Vinodbhai', 'Has no complaints about how the market runs or how clean it is.'], ['Monika', 'Feels safe here as a woman, even late at night.'], ['Ansar', 'Likes the market as it is.']]],
    ['disappointment & concern', [['Krishna and Laxmanbhai', 'Point to unhygienic washrooms and poor facilities for women.'], ['Ravi Kumar, AMC sweeper', 'His wages don’t cover basic needs.'], ['Raju', 'Worries the market won’t survive against branded stores.']]],
    ['hope & optimism', [['Manushree', 'Pictures a renewed market in ten years, with better parking and new stores.'], ['Monika', 'Wants outdated shops revamped for today’s needs, like more grocery stores.']]],
    ['nostalgia', [['Monika', 'The market is the backdrop to her childhood memories.'], ['Manushree', 'Remembers it as a warm, safe place when she was young.']]],
    ['adaptation & resilience', [['Vinodbhai', 'His family keeps their toy business going despite the obstacles.'], ['Ansar, larry owner', 'Keeps his business running despite worrying about change.']]],
    ['declining footfall', [['Neel', 'Sees fewer visitors and blames growing competition.'], ['Raju', 'Has noticed business slowing down.']]]
  ];
const DAY = [
    [6, 8, 'home', '6am – 8am', 'She wakes up, fetches water from the local tank for the house, then starts the household chores.'],
    [8, 12, 'home', '8am – 12pm', 'She wakes her kids, gets them ready for school and finishes the rest of the chores.'],
    [12, 13, 'home', '12pm – 1pm', 'She makes lunch for the family with her sister.'],
    [13, 14, 'src', '1pm – 2pm', 'She checks her stock. If it’s low, she goes with her husband to Kalupur market to buy toys and materials.'],
    [14, 15, 'home', '2pm – 3pm', 'Back home: a break, lunch, and the last of the chores.'],
    [15, 16, 'rest', '3pm – 4pm', 'She sleeps for about an hour to recharge before the market.'],
    [16, 17, 'walk', '4pm – 5pm', 'She packs the stall items and walks to the stall area, ready to set up at 5.'],
    [17, 20, 'stall', '5pm – 8pm', 'She sets up the roadside stall with her family, cleans the area around it to avoid being fined, and keeps the pavement clear for people walking by.'],
    [20, 24, 'stall', '8pm – 12am', 'They ask visitors to buy them dinner, or go home on an empty stomach after packing up.']
  ];
const KIND = { home: 'home and family', src: 'sourcing stock', rest: 'rest', walk: 'getting to the stall', stall: 'at the stall' };
const EVE = [
    ['Before arrival', ['They decide when to come based on the previous day’s earnings.', 'Good sales means arriving early; if not, they wait until evening.', 'Sometimes they grab tea before heading to the stall.']],
    ['Setup', ['They arrive around 4:30pm and set up the belts quickly. They’ve clearly done this hundreds of times.', 'The stall is basic but organised.', 'A quick chat with the vendors nearby while setting up.']],
    ['Selling time', ['Customers expect to bargain; they handle it calmly and often lower the price.', 'Friendly with regulars: a nod or a wave to familiar faces.', 'When a UPI payment or phone acts up, nearby vendors help without hesitation.', 'Tea and snacks are sometimes shared among vendors.']],
    ['After sunset', ['They stay after dark, hoping for last-minute customers.', 'They don’t pack up early, because every sale matters.', 'They check on each other’s sales with nearby vendors.']],
    ['Pack-up and exit', ['Packing up takes minutes; each of them knows exactly what to do.', 'A few quick words with the other vendors before leaving.']]
  ];
return {PLAN,THEMES,DAY,KIND,EVE};})();