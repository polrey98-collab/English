// =====================================================================
// CURSO — EN C1
// ---------------------------------------------------------------------
// Cada unidad se convierte en 5 sesiones (ver DAYS). Para añadir una
// unidad nueva, copia una existente, cambia el id y el contenido.
// Texto con *asteriscos* se muestra en negrita.
// Ejercicios:
//   { type: 'gap',    q: 'frase con ___', a: ['respuesta', 'alternativa'] }
//   { type: 'choice', q: 'pregunta', options: [...], a: índice_correcto }
//   { type: 'fix',    q: 'frase incorrecta', a: ['versión correcta', ...] }
// =====================================================================

const DAYS = [
  { n: 1, title: 'Vocabulario y lectura',      icon: '📖', mins: 25, steps: ['review', 'vocab', 'vocabQuiz', 'reading'] },
  { n: 2, title: 'Gramática',                  icon: '🏗️', mins: 25, steps: ['review', 'grammar', 'exercises'] },
  { n: 3, title: 'Listening y pronunciación',  icon: '🎧', mins: 25, steps: ['review', 'listening', 'shadowing'] },
  { n: 4, title: 'Speaking',                   icon: '🗣️', mins: 20, steps: ['review', 'vocabGap', 'speaking'] },
  { n: 5, title: 'Writing y test de unidad',   icon: '✍️', mins: 30, steps: ['review', 'writing', 'unitTest'] },
];

const UNITS = [
  // ===================================================================
  {
    id: 'u1', emoji: '💼', title: 'Work & Careers', level: 'B2',
    vocab: [
      { w: 'workload', def: 'the amount of work a person has to do', ex: 'My workload has doubled since my colleague left.' },
      { w: 'deadline', def: 'the time or date by which something must be finished', ex: "We're working late to meet the deadline." },
      { w: 'promotion', def: 'a move to a more important job in the same organisation', ex: 'She got a promotion after only two years.' },
      { w: 'delegate', def: 'to give part of your work or responsibility to someone else', ex: 'Good managers know how to delegate.' },
      { w: 'burnout', def: 'extreme tiredness caused by working too hard for too long', ex: 'Long hours and constant pressure can lead to burnout.' },
      { w: 'negotiate', def: 'to discuss something formally in order to reach an agreement', ex: "I'm going to negotiate a higher salary." },
      { w: 'skill set', def: 'the range of abilities and experience a person has', ex: 'Her skill set is perfect for this role.' },
      { w: 'in charge of', def: 'responsible for a group of people or an activity', ex: "He's in charge of the marketing team." },
      { w: 'flexible hours', def: 'a system where you can choose when you start and finish work', ex: 'The company offers flexible hours and remote work.' },
      { w: 'take on', def: 'to accept a job, responsibility or challenge', ex: "I've decided to take on a new project." },
    ],
    reading: {
      title: 'The rise of the portfolio career',
      text: `For most of the twentieth century, the ideal career was simple: you joined a company after university, climbed the ladder and retired with a pension. Today, that model looks increasingly outdated. A growing number of professionals are building what experts call a "portfolio career" – a working life made up of several different jobs, projects and clients at the same time.

Take Laura, a 34-year-old designer from Valencia. She has worked for three agencies, and for the last two years she has been running her own studio while teaching a course at a local university. "I've never felt more in control of my time," she says. "But I've also learned that freedom comes with a price. Some months I earn twice as much as I did in my old job; other months, I barely cover my bills."

Supporters of portfolio careers argue that they reduce risk: if one client disappears, you still have others. They also allow people to develop a wider skill set and to avoid the burnout that often comes with doing the same job for years. Critics, however, point out that this lifestyle can be lonely and stressful, and that it often means giving up benefits such as paid holidays and sick leave.

What seems clear is that employers have started to adapt. Many companies now offer flexible hours, part-time contracts and remote work in order to attract talent. For workers, the key skill is no longer loyalty to a single employer, but the ability to learn quickly and manage their own careers.`,
      questions: [
        { q: 'What was the traditional career model?', options: ['Working for several companies at once', 'Staying in one company until retirement', 'Changing jobs every two years', 'Working from home'], a: 1 },
        { q: 'How does Laura feel about her portfolio career?', options: ['Completely negative', 'Positive, but aware of the disadvantages', 'She regrets leaving her old job', 'She wants to go back to an agency'], a: 1 },
        { q: 'According to supporters, one advantage is that portfolio careers…', options: ['pay more every month', 'reduce the risk of losing all your income', 'guarantee paid holidays', 'are never stressful'], a: 1 },
        { q: 'Which criticism is mentioned?', options: ['They can be lonely', 'They are only for designers', 'They are illegal in some countries', 'They require a university degree'], a: 0 },
        { q: 'According to the last paragraph, the key skill today is…', options: ['loyalty to one employer', 'learning quickly and managing your own career', 'speaking several languages', 'working long hours'], a: 1 },
      ],
    },
    grammar: {
      title: 'Present perfect vs past simple',
      explain: [
        'Use the *past simple* for finished actions at a finished time: *I joined the company in 2019.* / *I saw him yesterday.*',
        'Use the *present perfect simple* for experiences and results connected to now, with no finished time: *I\'ve worked for three companies.* / *She\'s just finished the report.*',
        'Use the *present perfect continuous* to focus on the duration of an activity that started in the past and continues now: *I\'ve been working here for five years.*',
        '*for* + a period (for three years) · *since* + a starting point (since 2019, since I was a child).',
      ],
      trap: 'En español dices "trabajo aquí desde 2019" (presente). En inglés NUNCA uses presente aquí: *I\'ve been working / I\'ve worked here since 2019*.',
      exercises: [
        { type: 'gap', q: 'I ___ (work) here since 2019.', a: ['have been working', 'have worked'] },
        { type: 'gap', q: 'We ___ (meet) the new CEO last Monday.', a: ['met'] },
        { type: 'gap', q: 'She ___ (be) to Japan three times.', a: ['has been', "'s been"] },
        { type: 'choice', q: 'How long ___ English?', options: ['do you study', 'have you been studying', 'did you study', 'are you studying'], a: 1 },
        { type: 'choice', q: "I ___ my keys. I can't get into the house.", options: ['lost', 'have lost', 'have been losing', 'was losing'], a: 1 },
        { type: 'gap', q: 'They ___ (not finish) the project yet.', a: ['have not finished'] },
        { type: 'choice', q: 'When ___ your current job?', options: ['have you started', 'did you start', 'have you been starting', 'do you start'], a: 1 },
        { type: 'fix', q: 'I live in Barcelona since ten years.', a: ['I have lived in Barcelona for ten years.', 'I have been living in Barcelona for ten years.'] },
        { type: 'gap', q: 'You look exhausted. Have you ___ (run)?', a: ['been running'] },
        { type: 'fix', q: 'I have seen that film last week.', a: ['I saw that film last week.'] },
      ],
    },
    listening: {
      title: 'A job interview',
      speakers: { A: 'Interviewer', B: 'Candidate' },
      lines: [
        ['A', 'Thanks for coming in today. So, tell me a bit about your current role.'],
        ['B', "Sure. I've been working as a project coordinator at a logistics company for about four years. I'm in charge of a team of six people, and I deal with clients in Spain and the UK."],
        ['A', 'And why are you looking for a change now?'],
        ['B', "Well, I've learned a lot there, but I feel I've reached a ceiling. Last year I took on a big international project and really enjoyed it, so I'd like a role with more international responsibility."],
        ['A', 'What would you say is your biggest achievement so far?'],
        ['B', "Probably reducing our delivery times. When I joined, orders took around five days. We redesigned the process, and now it's two days on average."],
        ['A', 'Impressive. And a weakness?'],
        ['B', "I used to find it hard to delegate. I wanted to do everything myself. But I've been working on it, and now I trust my team much more."],
      ],
      questions: [
        { q: 'How long has the candidate been in the current job?', options: ['About two years', 'About four years', 'Six years', 'Five months'], a: 1 },
        { q: 'Why does the candidate want to change jobs?', options: ['The salary is too low', 'They want more international responsibility', "They don't like their team", 'The company is closing'], a: 1 },
        { q: 'What was their biggest achievement?', options: ['Winning a big client', 'Reducing delivery times', 'Hiring six people', 'Opening an office in the UK'], a: 1 },
        { q: 'What weakness do they mention?', options: ['Arriving late', 'Finding it hard to delegate', 'Poor English', 'Missing deadlines'], a: 1 },
      ],
    },
    shadowing: [
      "I've been working here for about four years.",
      "I'm in charge of a team of six people.",
      "I feel I've reached a ceiling in my current role.",
      'I used to find it hard to delegate.',
      "We redesigned the process, and now it takes two days.",
      "I'd like a role with more international responsibility.",
    ],
    speaking: {
      prompt: "Describe your current job (or your last one): what you do, how long you've been doing it, and what you'd like to change.",
      prep: ['Start with the big picture: company, role and how long (present perfect!).', 'Give one concrete example of a typical task or an achievement.', "Finish with your plans or what you'd like to change."],
      phrases: ["I've been working as… for…", 'My main responsibilities include…', "One thing I'm proud of is…", "In the future, I'd like to…"],
    },
    writing: {
      prompt: "Write the 'About' section of your LinkedIn profile.",
      words: [120, 180],
      useful: ['I have X years of experience in…', 'I specialise in…', "Over the past few years, I've…", "I'm currently looking for…"],
      checklist: ["Uses the present perfect for experience (I've worked, I've led…)", 'Includes at least one concrete result (numbers!)', 'Uses 3+ words from this unit', "Ends with what you're looking for now"],
      model: `I'm a project coordinator with over four years of experience in international logistics. I specialise in improving processes and helping teams work more efficiently. Over the past few years, I've led a team of six people and managed clients in Spain and the UK. One of the projects I'm most proud of reduced our average delivery time from five days to two.

I enjoy solving complex problems, negotiating with suppliers and turning messy situations into clear plans. I've also learned how important it is to delegate and to trust the people I work with.

I'm currently looking for a role with more international responsibility, where I can keep developing my leadership skills and take on bigger challenges.`,
    },
  },

  // ===================================================================
  {
    id: 'u2', emoji: '🤖', title: 'Technology & AI', level: 'B2',
    vocab: [
      { w: 'cutting-edge', def: 'the most modern and advanced', ex: 'The lab uses cutting-edge equipment.' },
      { w: 'automate', def: 'to make a process work by machines or computers instead of people', ex: 'Many companies want to automate repetitive tasks.' },
      { w: 'breakthrough', def: 'an important new discovery or development', ex: 'Scientists have made a breakthrough in battery technology.' },
      { w: 'rely on', def: 'to depend on someone or something', ex: 'We rely on our phones for almost everything.' },
      { w: 'privacy', def: 'the right to keep your personal information and life secret', ex: 'Many users worry about their privacy online.' },
      { w: 'outdated', def: 'old-fashioned and no longer useful', ex: 'Our software is outdated and needs replacing.' },
      { w: 'keep up with', def: 'to stay informed about changes or move at the same speed', ex: "It's hard to keep up with new technology." },
      { w: 'drawback', def: 'a disadvantage or problem', ex: 'The main drawback of this tool is the price.' },
      { w: 'user-friendly', def: 'easy to use or understand', ex: 'The new app is much more user-friendly.' },
      { w: 'phase out', def: 'to stop using something gradually', ex: 'The company will phase out paper invoices next year.' },
    ],
    reading: {
      title: 'Will AI take your job?',
      text: `Few questions cause as much anxiety in today's workplace as this one. Every few months, a new study predicts how many jobs will disappear because of artificial intelligence, and the numbers are often frightening. But the reality is more complicated than the headlines suggest.

History shows that technology rarely eliminates entire professions overnight. Instead, it changes what people do. When spreadsheets appeared in the 1980s, many people thought accountants would become unnecessary. In fact, the number of accountants grew, because they could now spend less time on calculations and more time on analysis and advice.

Many experts believe AI is going to follow a similar pattern. Tasks that are repetitive and predictable, such as writing standard emails, summarising documents or checking data, will increasingly be automated. Tasks that require judgement, creativity and human relationships are much harder to replace.

That doesn't mean everyone is safe. Workers who refuse to keep up with new tools may find that their skills become outdated. As one technology consultant puts it, "AI won't replace you, but a person who uses AI well might." By 2030, she predicts, most office workers will be using AI assistants every day, in the same way that we rely on search engines today.

The real challenge, then, may not be technological but educational. Companies and governments will need to invest in training so that workers can adapt – and individuals will need to see learning as something they do throughout their lives, not just at school.`,
      questions: [
        { q: 'According to the text, headlines about AI and jobs are…', options: ['completely accurate', 'often simpler and more alarming than reality', 'always optimistic', 'ignored by most people'], a: 1 },
        { q: 'What happened to accountants after spreadsheets appeared?', options: ['Most lost their jobs', 'Their number increased', 'They stopped doing analysis', 'They refused to use computers'], a: 1 },
        { q: 'Which tasks are most likely to be automated?', options: ['Tasks requiring creativity', 'Repetitive and predictable tasks', 'Tasks based on relationships', 'Management tasks'], a: 1 },
        { q: '"AI won\'t replace you, but a person who uses AI well might" means…', options: ['AI is dangerous', 'Workers with AI skills have an advantage', 'AI will replace everyone', 'People should avoid AI'], a: 1 },
        { q: 'The writer thinks the real challenge is…', options: ['technological', 'educational', 'financial', 'legal'], a: 1 },
      ],
    },
    grammar: {
      title: 'Talking about the future',
      explain: [
        '*will*: predictions based on opinion and instant decisions: *I think AI will change everything.* / *I\'ll call you later.*',
        '*going to*: plans you have already decided and predictions based on evidence: *We\'re going to launch the app in May.* / *Look at those clouds — it\'s going to rain.*',
        '*present continuous*: fixed arrangements with a time or place: *I\'m meeting the client on Friday.*',
        '*future continuous* (will be + -ing): an action in progress at a future moment: *This time next year, I\'ll be working in London.*',
        '*future perfect* (will have + past participle): completed before a future moment: *By 2030, most companies will have automated these tasks.*',
      ],
      trap: 'No uses *will* después de *when / if / as soon as / before*, aunque hables del futuro: *When I finish* (no *when I will finish*).',
      exercises: [
        { type: 'choice', q: "I've already decided: I ___ a course on data analysis.", options: ['will take', 'am going to take', 'take', 'will have taken'], a: 1 },
        { type: 'choice', q: "Don't worry, I ___ you with the presentation.", options: ["'m helping", "'ll help", "'m going to be helping", 'help'], a: 1 },
        { type: 'gap', q: 'By the end of the year, we ___ (finish) the migration.', a: ['will have finished'] },
        { type: 'gap', q: 'This time tomorrow, I ___ (fly) to New York.', a: ['will be flying'] },
        { type: 'choice', q: "I ___ the dentist at 5 pm tomorrow. It's in my calendar.", options: ['see', "'m seeing", 'will have seen', 'would see'], a: 1 },
        { type: 'fix', q: "I'll call you when I will arrive.", a: ['I will call you when I arrive.', 'I will call you when I get there.'] },
        { type: 'gap', q: 'Look at the sales figures! We ___ (miss) our target.', a: ['are going to miss'] },
        { type: 'gap', q: 'By the time you read this, I ___ (leave) the company.', a: ['will have left'] },
      ],
    },
    listening: {
      title: 'Planning a software update',
      speakers: { A: 'Marta (manager)', B: 'Tom (developer)' },
      lines: [
        ['A', 'Tom, where are we with the new version of the app?'],
        ['B', "We're nearly there. We're going to release it to a small group of users next Monday, and if everything goes well, everyone will have it by the end of the month."],
        ['A', 'Great. And the old payment system?'],
        ['B', "We're phasing it out gradually. By June, we'll have moved all our customers to the new one."],
        ['A', "What's the main risk?"],
        ['B', "Honestly, the biggest drawback is that some older phones won't support the update. We'll need to send those users a message."],
        ['A', "OK. I'm meeting the client on Thursday, so I'll explain the timeline then. Can you send me a short summary before that?"],
        ['B', "Sure, I'll do it this afternoon."],
      ],
      questions: [
        { q: 'When will a small group of users get the new version?', options: ['Today', 'Next Monday', 'On Thursday', 'In June'], a: 1 },
        { q: 'What will have happened by June?', options: ['The app will be deleted', 'All customers will use the new payment system', 'Tom will leave', 'The client will visit'], a: 1 },
        { q: 'What is the main drawback?', options: ['The update is expensive', "Some older phones won't support it", 'The team is too small', 'The client is unhappy'], a: 1 },
        { q: 'What will Tom do this afternoon?', options: ['Meet the client', 'Write a summary', 'Release the app', 'Call the users'], a: 1 },
      ],
    },
    shadowing: [
      "We're going to release it next Monday.",
      "By June, we'll have moved all our customers.",
      "This time next year, I'll be working abroad.",
      'I think AI will change the way we work.',
      "It's hard to keep up with new technology.",
      'The main drawback is the price.',
    ],
    speaking: {
      prompt: 'How will technology change your job or your daily life in the next ten years? Make predictions and explain your plans to adapt.',
      prep: ['Two or three predictions (will / might / is likely to).', "Your concrete plans (I'm going to…).", 'One risk or drawback and how to deal with it.'],
      phrases: ["In ten years' time, I think…", "It's likely that…", "I'm going to…", "By 2035, we'll probably have…"],
    },
    writing: {
      prompt: 'Email to your team announcing a new tool or process: what will change, when, and what they need to do.',
      words: [120, 170],
      useful: ["I'm writing to let you know that…", "From next Monday, we'll be using…", 'By the end of the month, we will have…', "If you have any questions, don't hesitate to…"],
      checklist: ['Clear subject and purpose in the first line', 'At least 3 different future forms', 'A clear action for the reader', 'Polite, professional closing'],
      model: `Subject: New project management tool from 1 March

Hi everyone,

I'm writing to let you know that we're going to switch to a new project management tool, TaskFlow, starting on 1 March. The current system is outdated, and TaskFlow is much more user-friendly.

Next week, I'll be running two short training sessions (Tuesday and Thursday at 10 am). Please sign up for one of them using the link below. By the end of February, IT will have moved all current projects to the new tool, so you won't lose any information.

We'll phase out the old system gradually, and it will be switched off completely on 31 March.

If you have any questions, don't hesitate to get in touch.

Best regards,
Pol`,
    },
  },

  // ===================================================================
  {
    id: 'u3', emoji: '💶', title: 'Money & Economy', level: 'B2',
    vocab: [
      { w: 'afford', def: 'to have enough money to pay for something', ex: "We can't afford a new car this year." },
      { w: 'savings', def: 'money that you keep for the future', ex: 'She keeps her savings in an index fund.' },
      { w: 'inflation', def: 'the general rise in prices over time', ex: 'High inflation makes everything more expensive.' },
      { w: 'invest', def: 'to put money into something in order to make a profit', ex: "It's wise to invest for the long term." },
      { w: 'debt', def: 'money that you owe to someone', ex: 'They paid off all their debt in three years.' },
      { w: 'budget', def: 'a plan of how much money you will spend', ex: 'I make a monthly budget to control my spending.' },
      { w: 'cut back on', def: 'to reduce the amount of something you use or buy', ex: 'We need to cut back on eating out.' },
      { w: 'income', def: 'money that you receive regularly, for example from work', ex: 'Rent takes 40% of my income.' },
      { w: 'worthwhile', def: 'worth the time, money or effort', ex: 'Learning English is a worthwhile investment.' },
      { w: 'bankrupt', def: 'unable to pay your debts, so a business has to close', ex: 'The company went bankrupt after the crisis.' },
    ],
    reading: {
      title: 'The latte factor: does it really matter?',
      text: `Personal finance experts love a simple story. If you stopped buying a €3 coffee every day and invested that money instead, they say, you would have a small fortune by the time you retired. This idea, known as the "latte factor", has been repeated in books and articles for decades.

There is some truth in it. Small, regular expenses add up: €3 a day is more than €1,000 a year. And if that money had been invested over thirty years, compound interest would have turned it into a much larger amount.

However, many economists think the latte factor misses the point. For most families, the big financial decisions are not about coffee but about housing, transport and debt. If you choose a flat that takes half your income, no amount of cutting back on small pleasures will save your budget. Similarly, if you have expensive credit card debt, paying it off is usually far more worthwhile than skipping breakfast at a café.

There is also a psychological argument. People who deny themselves every small pleasure often find it hard to stick to their plans. A realistic budget, many advisers say, should include some money for enjoyment.

So what is the lesson? Small savings are useful, especially when you are starting out. But if you want to change your financial future, focus first on the big numbers — and then enjoy your coffee.`,
      questions: [
        { q: 'What is the "latte factor"?', options: ['A type of investment fund', 'The idea that small daily savings can grow into a lot of money', 'A tax on coffee', 'A method to avoid debt'], a: 1 },
        { q: 'Why do many economists criticise the idea?', options: ['Coffee is not expensive', 'Big decisions like housing matter much more', "Compound interest doesn't exist", "People don't drink coffee"], a: 1 },
        { q: 'According to the text, paying off credit card debt is…', options: ['less important than saving on coffee', 'usually more worthwhile than skipping small pleasures', 'impossible for most people', 'a psychological mistake'], a: 1 },
        { q: 'What is the psychological argument?', options: ['Denying yourself every pleasure makes plans harder to keep', 'Coffee improves productivity', "Rich people don't budget", 'Saving makes people unhappy'], a: 0 },
      ],
    },
    grammar: {
      title: 'Conditionals (1st, 2nd, 3rd and mixed)',
      explain: [
        '*Zero* (always true): *If you heat ice, it melts.*',
        '*First* (real future): *If prices go up, we\'ll cut back.*',
        '*Second* (unreal present or future): *If I had more money, I would invest it.* In formal English: *If I were you…*',
        '*Third* (unreal past): *If I had invested in 2015, I would have made a fortune.*',
        '*Mixed*: past condition → present result: *If I had saved more, I would be richer now.* Present condition → past result: *If I were more careful, I wouldn\'t have lost that money.*',
        'C1 alternatives to *if*: *unless, provided that, as long as, supposing, otherwise*.',
      ],
      trap: 'Nunca *would* en la parte del *if*: *If I had known* (no *If I would have known*).',
      exercises: [
        { type: 'gap', q: 'If I ___ (have) more time, I would learn to code.', a: ['had'] },
        { type: 'gap', q: 'If we had left earlier, we ___ (not miss) the flight.', a: ['would not have missed'] },
        { type: 'choice', q: "If you ___ the bill today, you'll get a discount.", options: ['pay', 'paid', 'will pay', 'would pay'], a: 0 },
        { type: 'gap', q: 'If I had accepted that job in London, I ___ (live) there now.', a: ['would be living', "'d be living", 'would live', "'d live"] },
        { type: 'choice', q: "___ you save regularly, you won't reach your goal.", options: ['If', 'Unless', 'Provided that', 'As long as'], a: 1 },
        { type: 'fix', q: 'If I would have known, I would have told you.', a: ['If I had known, I would have told you.', "If I'd known, I would have told you.", "If I had known, I'd have told you.", "If I'd known, I'd have told you."] },
        { type: 'gap', q: 'If I ___ (be) you, I would pay off the debt first.', a: ['were', 'was'] },
        { type: 'choice', q: 'You can borrow my car ___ you drive carefully.', options: ['unless', 'otherwise', 'as long as', 'even if'], a: 2 },
      ],
    },
    listening: {
      title: 'Asking for advice at the bank',
      speakers: { A: 'Adviser', B: 'Customer' },
      lines: [
        ['B', "Hi, I've got some savings and I'm not sure what to do with them. At the moment they're just in my current account."],
        ['A', 'OK. First question: do you have any debt?'],
        ['B', 'Only a small loan for my car. About three thousand euros left.'],
        ['A', "What's the interest rate?"],
        ['B', 'Around eight percent, I think.'],
        ['A', "Then, honestly, if I were you, I'd pay that off first. You won't find a safe investment that pays eight percent."],
        ['B', 'That makes sense. And after that?'],
        ['A', "Keep three to six months of expenses as an emergency fund. Then, as long as you don't need the money for at least five years, you could consider investing in a diversified fund."],
        ['B', 'And if the market falls?'],
        ['A', "It will fall sometimes. If you had invested ten years ago and stayed calm, you'd be well ahead now. The key is not to panic."],
      ],
      questions: [
        { q: "Where is the customer's money now?", options: ['In a fund', 'In a current account', 'In cash at home', 'In property'], a: 1 },
        { q: 'What does the adviser recommend first?', options: ['Investing everything', 'Paying off the car loan', 'Buying property', 'Opening a new account'], a: 1 },
        { q: 'How much should the emergency fund cover?', options: ['One month', 'Three to six months of expenses', 'A year', 'Ten years'], a: 1 },
        { q: 'What is "the key", according to the adviser?', options: ['Not panicking when markets fall', 'Choosing individual shares', 'Selling quickly', 'Avoiding all risk'], a: 0 },
      ],
    },
    shadowing: [
      "If I were you, I'd pay that off first.",
      "As long as you don't need the money, you could invest it.",
      "If I had invested ten years ago, I'd be well ahead now.",
      "We can't afford it at the moment.",
      'The key is not to panic.',
      "It's a worthwhile investment.",
    ],
    speaking: {
      prompt: "Talk about a financial decision you made (or didn't make) in the past, and how your life would be different if you had decided differently.",
      prep: ['Describe the situation and the decision.', 'Use a third or mixed conditional to imagine the alternative.', 'Give advice to someone in the same situation (If I were you…).'],
      phrases: ['Looking back,…', 'If I had…, I would have…', "I'd probably be… now", "If I were you, I'd…"],
    },
    writing: {
      prompt: 'Opinion paragraph: Should schools teach personal finance as a compulsory subject?',
      words: [150, 200],
      useful: ['There is no doubt that…', 'If young people learnt…, they would…', 'Unless…', 'On the other hand,…', 'All things considered,…'],
      checklist: ['Clear opinion in the first sentence', 'At least 2 conditionals of different types', 'One counter-argument', 'Conclusion that repeats your opinion in new words'],
      model: `In my opinion, personal finance should definitely be a compulsory subject in secondary schools. Most adults make important financial decisions — renting a flat, taking out a loan or choosing a pension — without ever having been taught the basics. If young people learnt how interest and inflation work, they would be far less likely to fall into debt. Many of my friends say that if someone had explained these ideas to them at sixteen, they would have avoided expensive mistakes.

On the other hand, some people argue that the curriculum is already overloaded, and that families should be responsible for this kind of education. However, not every family has the knowledge to do this, so leaving it to parents would only increase inequality.

All things considered, a short, practical course would be a worthwhile investment for society as a whole.`,
    },
  },

  // ===================================================================
  {
    id: 'u4', emoji: '🏋️', title: 'Health & Fitness', level: 'B2+',
    vocab: [
      { w: 'work out', def: 'to do physical exercise to improve your fitness', ex: 'I work out at the gym four times a week.' },
      { w: 'sedentary', def: 'involving a lot of sitting and little physical activity', ex: 'A sedentary lifestyle increases health risks.' },
      { w: 'recover', def: 'to become healthy or strong again after an illness or injury', ex: 'It takes time to recover from a serious injury.' },
      { w: 'injury', def: 'physical harm or damage to the body', ex: 'He had to stop running because of a knee injury.' },
      { w: 'boost', def: 'to increase or improve something', ex: 'Regular exercise can boost your mood.' },
      { w: 'consistency', def: 'doing something in the same way regularly over time', ex: 'Consistency matters more than intensity.' },
      { w: 'moderation', def: 'avoiding extremes; not too much of something', ex: 'Eating sweets in moderation is fine.' },
      { w: 'well-being', def: 'the state of feeling healthy, comfortable and happy', ex: 'Sleep is essential for mental well-being.' },
      { w: 'get into shape', def: 'to become physically fit', ex: 'I want to get into shape before the summer.' },
      { w: 'strain', def: 'pressure on something; or an injury to a muscle', ex: 'Stress puts a lot of strain on your heart.' },
    ],
    reading: {
      title: "Why most New Year's fitness resolutions fail",
      text: `Every January, gyms fill up with enthusiastic new members. By February, many of them have disappeared. Research suggests that fewer than one in five people who make a fitness resolution are still following it after a few months. So what goes wrong?

One explanation is that people aim too high. Someone who has had a sedentary lifestyle for years decides to work out every day, follows an extremely strict diet and expects visible results within weeks. When the results don't arrive — or when an injury appears — motivation collapses.

Sports scientists increasingly argue that consistency matters far more than intensity. Three moderate sessions a week, maintained for a year, will do much more for your health than two months of exhausting training followed by nothing. Small, specific habits — a twenty-minute walk after lunch, taking the stairs, going to bed half an hour earlier — are easier to keep and still boost physical and mental well-being.

Another key factor is identity. People who say "I'm trying to get into shape" often give up, while those who say "I'm the kind of person who trains" tend to continue. When exercise becomes part of who you are, rather than something you force yourself to do, it no longer depends on motivation alone.

Finally, rest matters. Your body improves while it recovers, not while it trains. Sleep and recovery days are not a sign of laziness; they are part of the programme.`,
      questions: [
        { q: 'What happens to most new gym members?', options: ['They stay all year', 'Many stop coming within weeks', 'They become trainers', 'They get injured immediately'], a: 1 },
        { q: 'According to the text, a common mistake is…', options: ['training too little', 'aiming too high too quickly', 'sleeping too much', 'walking after lunch'], a: 1 },
        { q: 'What do sports scientists say matters most?', options: ['Intensity', 'Consistency', 'Expensive equipment', 'Strict diets'], a: 1 },
        { q: 'Why is identity important?', options: ['It makes exercise less dependent on motivation', 'It helps you lose weight faster', 'It prevents injuries', 'Gyms require it'], a: 0 },
        { q: 'What does the writer say about rest?', options: ['It is a sign of laziness', 'It is part of improving', 'It should be avoided', 'It only matters for athletes'], a: 1 },
      ],
    },
    grammar: {
      title: 'Modals of deduction (present and past)',
      explain: [
        'How sure are you? *must* = I\'m sure it\'s true: *He must be tired; he\'s been training for hours.*',
        '*might / may / could* = it\'s possible: *She might be at the gym.*',
        '*can\'t* = I\'m sure it\'s NOT true: *That can\'t be right.*',
        'Past: modal + *have* + past participle: *He must have forgotten.* / *She might have missed the bus.* / *They can\'t have finished already.*',
        'Continuous: *He must be working late.* / *She must have been running.*',
      ],
      trap: '"Debe de estar cansado" = *He must be tired*. Pero "no debe de ser verdad" = *It can\'t be true* (nunca *mustn\'t*, que significa prohibición).',
      exercises: [
        { type: 'choice', q: "He's been running for two hours. He ___ be exhausted.", options: ["can't", 'must', "mustn't", 'should'], a: 1 },
        { type: 'choice', q: "That ___ be Anna — she's in London this week.", options: ['must', 'might', "can't", 'could'], a: 2 },
        { type: 'gap', q: 'The streets are wet. It ___ (rain) during the night.', a: ['must have rained', 'must have been raining'] },
        { type: 'gap', q: "I can't find my phone. I ___ (leave) it at the gym. (possible)", a: ['might have left', 'may have left', 'could have left'] },
        { type: 'choice', q: 'She ___ have seen my message, or she would have replied.', options: ['must', "can't", 'should', 'would'], a: 1 },
        { type: 'fix', q: "He mustn't be at home; the lights are off.", a: ["He can't be at home; the lights are off.", "He can't be at home, the lights are off.", "He cannot be at home; the lights are off."] },
        { type: 'gap', q: 'You ___ (train) hard — you look much fitter!', a: ['must have been training', 'must have trained'] },
        { type: 'choice', q: "I'm not sure where Tom is. He ___ be in a meeting.", options: ["can't", 'must', 'may', "mustn't"], a: 2 },
      ],
    },
    listening: {
      title: 'At the physio',
      speakers: { A: 'Physio', B: 'Patient' },
      lines: [
        ['A', 'So, what seems to be the problem?'],
        ['B', 'My knee has been hurting for about two weeks. It started after a long run.'],
        ['A', 'Did you notice anything unusual during the run?'],
        ['B', 'Not really. I increased the distance quite a lot that week, from ten to eighteen kilometres.'],
        ['A', 'That might be the reason. Increasing the distance so quickly puts a lot of strain on your joints. Does it hurt when you go downstairs?'],
        ['B', 'Yes, a lot.'],
        ['A', "Then it must be the tendon, not the bone. The good news is that you can't have done any serious damage, or it would be swollen. I'd recommend two weeks without running, some strength exercises, and then you can start again gradually."],
        ['B', "Two weeks? I've got a race next month!"],
        ['A', "If you rest now, you might still be able to do it. If you don't, you could miss the whole season."],
      ],
      questions: [
        { q: 'When did the pain start?', options: ['After a long run', 'After a football match', 'This morning', 'After a fall'], a: 0 },
        { q: 'What did the patient change that week?', options: ['Their shoes', 'The distance, increasing it a lot', 'Their diet', 'Their route'], a: 1 },
        { q: 'What does the physio think the problem is?', options: ['A broken bone', 'The tendon', 'A muscle tear', 'Nothing at all'], a: 1 },
        { q: 'What does the physio recommend?', options: ['Keep running', "Two weeks' rest plus strength exercises", 'Surgery', 'Running only downhill'], a: 1 },
      ],
    },
    shadowing: [
      'He must be exhausted after that session.',
      "That can't be right.",
      'I might have left it at the gym.',
      'You must have been training hard.',
      'Consistency matters more than intensity.',
      'It puts a lot of strain on your joints.',
    ],
    speaking: {
      prompt: "Describe your training or health routine. What works, what doesn't, and what would you change?",
      prep: ['Describe your routine (how often, what type of training).', 'Explain why something worked or failed (It must have been because…).', "One change you'll make and why."],
      phrases: ['The key for me is…', 'I think it must have been…', 'What really makes a difference is…', "I'm planning to…"],
    },
    writing: {
      prompt: 'Email to a friend who wants to start exercising but always gives up. Give advice.',
      words: [130, 180],
      useful: ['I know how you feel…', "Why don't you…?", 'The key is to…', "If I were you, I'd…", 'Trust me,…'],
      checklist: ['Informal but correct tone', 'At least 3 pieces of concrete advice', "At least 1 modal of deduction (you must be…, it might have been…)", 'Friendly closing'],
      model: `Hi Marc,

I know how you feel — you must be frustrated after starting and stopping so many times. But honestly, I don't think the problem is you. I think it might have been your plan.

Last time you tried to go to the gym every day and follow a really strict diet at the same time. That's too much for anyone! The key is to start small. Why don't you try three short sessions a week, just thirty minutes each? And instead of changing your whole diet, just cut down on sugary drinks.

Another tip: train with someone. If you've arranged to meet a friend, it's much harder to skip a session. And don't forget to rest — your body gets stronger when it recovers.

Let me know if you want to come running with me on Saturdays!

Take care,
Pol`,
    },
  },

  // ===================================================================
  {
    id: 'u5', emoji: '✈️', title: 'Travel & Culture', level: 'B2+',
    vocab: [
      { w: 'off the beaten track', def: 'in a place that few tourists visit', ex: 'We stayed in a village off the beaten track.' },
      { w: 'overtourism', def: 'a situation where too many tourists visit a place', ex: 'Barcelona has struggled with overtourism for years.' },
      { w: 'broaden your horizons', def: 'to increase your knowledge and experience', ex: 'Travelling helps you broaden your horizons.' },
      { w: 'culture shock', def: 'the confusion you feel when you experience a very different culture', ex: 'I suffered from culture shock when I moved to Japan.' },
      { w: 'itinerary', def: 'a detailed plan of a journey', ex: 'Our itinerary includes three cities in five days.' },
      { w: 'breathtaking', def: 'extremely beautiful or impressive', ex: 'The view from the top was breathtaking.' },
      { w: 'immerse yourself in', def: 'to become completely involved in something', ex: 'The best way to learn a language is to immerse yourself in it.' },
      { w: 'locals', def: 'people who live in a particular place', ex: 'Ask the locals where to eat.' },
      { w: 'sightseeing', def: 'visiting famous or interesting places as a tourist', ex: 'We spent the morning sightseeing in Rome.' },
      { w: 'hospitality', def: 'friendly and generous behaviour towards guests', ex: 'We were amazed by the hospitality of the people.' },
    ],
    reading: {
      title: 'Travelling like a local',
      text: `For years, the typical holiday meant a two-week package in a hotel by the beach. Today, more and more travellers say they want something different: to "live like a local". Instead of hotels, they rent flats in residential neighbourhoods; instead of guided tours, they look for markets, bars and events where locals actually go.

This trend, which has been encouraged by apps and social media, has clear benefits. Travellers who immerse themselves in daily life often have richer experiences, and the money they spend reaches small businesses rather than large international chains.

However, the story has another side. In cities such as Barcelona, Lisbon and Amsterdam, residents complain that short-term rentals have pushed up prices, forcing families who have lived in the centre for generations to move out. Neighbourhoods that were once quiet and authentic have become full of visitors looking for "authentic" experiences — which, ironically, makes them less authentic.

Some cities have reacted by limiting tourist flats or introducing taxes. Others encourage visitors to explore areas off the beaten track, spreading the benefits of tourism more evenly.

Perhaps the most responsible way to travel is not to pretend we are locals, but to behave like good guests: respecting the places we visit, learning a few words of the language and remembering that, for the people who live there, it is not a holiday destination but home.`,
      questions: [
        { q: 'What do "live like a local" travellers prefer?', options: ['Big hotels', 'Flats in residential areas and local places', 'Package holidays', 'Cruise ships'], a: 1 },
        { q: 'What is one benefit of this trend?', options: ['Money reaches small businesses', 'Flats become cheaper', 'Cities become quieter', 'Hotels earn more'], a: 0 },
        { q: 'What problem do residents mention?', options: ['Short-term rentals have pushed up prices', "Tourists don't spend money", 'There are too few flights', 'Shops refuse tourists'], a: 0 },
        { q: 'Why does the writer say "ironically"?', options: ['Tourists looking for authenticity make places less authentic', "Locals don't like travelling", 'Hotels are more authentic', 'Taxes are too low'], a: 0 },
        { q: 'What does the writer recommend?', options: ['Pretending to be a local', 'Behaving like a respectful guest', 'Never travelling', 'Only staying in hotels'], a: 1 },
      ],
    },
    grammar: {
      title: 'Relative clauses',
      explain: [
        '*Defining* (essential information, no commas): *The hotel that we booked was great.* Use *who* (people), *which/that* (things), *whose* (possession), *where* (places), *when* (time). You can omit the pronoun when it is the object: *The hotel (that) we booked…*',
        '*Non-defining* (extra information, with commas): *My sister, who lives in Lisbon, is visiting next week.* Never use *that* here, and never omit the pronoun.',
        '*which* can refer to a whole sentence: *The flight was cancelled, which was annoying.*',
        'C1 — reduced clauses: *the people living in the centre* (= who live) / *a book written in 1920* (= which was written).',
        'Prepositions: formal *the person to whom I spoke* · informal *the person I spoke to*.',
      ],
      trap: 'En español "que" sirve para todo. En inglés: no uses *that* después de coma, y no uses *what* como relativo: *the thing that I want* (no *the thing what I want*).',
      exercises: [
        { type: 'choice', q: 'The woman ___ bag was stolen called the police.', options: ['who', 'which', 'whose', 'that'], a: 2 },
        { type: 'choice', q: 'Lisbon, ___ I lived for two years, is my favourite city.', options: ['that', 'which', 'where', 'when'], a: 2 },
        { type: 'gap', q: 'My brother, ___ works in Berlin, is coming home for Christmas.', a: ['who'] },
        { type: 'choice', q: 'Our flight was delayed by six hours, ___ ruined our first day.', options: ['that', 'what', 'which', 'who'], a: 2 },
        { type: 'fix', q: 'The hotel, that we booked online, was fantastic.', a: ['The hotel, which we booked online, was fantastic.', 'The hotel which we booked online was fantastic.', 'The hotel that we booked online was fantastic.', 'The hotel we booked online was fantastic.'] },
        { type: 'gap', q: 'Tourists ___ (visit) the old town should respect the residents. (reduced clause)', a: ['visiting'] },
        { type: 'fix', q: 'This is exactly what I was looking for it.', a: ['This is exactly what I was looking for.'] },
        { type: 'choice', q: 'The guide to ___ we spoke was very knowledgeable.', options: ['whom', 'which', 'whose', 'that'], a: 0 },
      ],
    },
    listening: {
      title: 'Tips for a trip to Barcelona',
      speakers: { A: 'Anna (local)', B: 'Jack (visitor)' },
      lines: [
        ['B', "I'm going to Barcelona next month for five days. Any tips?"],
        ['A', "Sure! First, avoid staying right next to La Rambla. It's the area where most tourists go, and it's expensive and noisy. Gràcia, which is a bit further north, is much nicer."],
        ['B', 'Good to know. What about food?'],
        ['A', "Look for places where the menu is written only in Catalan or Spanish — that's usually a good sign. And have lunch late. Locals rarely eat before two."],
        ['B', "Two! That's a bit of a culture shock."],
        ['A', "You'll get used to it. Oh, and if you like hiking, take the train to Montserrat. The views are breathtaking."],
        ['B', 'Is it far?'],
        ['A', "About an hour. Go early in the morning, when it's less crowded."],
      ],
      questions: [
        { q: 'Which area does Anna recommend staying in?', options: ['La Rambla', 'Gràcia', 'Montserrat', 'The beach'], a: 1 },
        { q: 'What is a good sign for a restaurant?', options: ['A menu only in Catalan or Spanish', 'A menu with photos', 'Lots of tourists', 'Open all day'], a: 0 },
        { q: 'Why is Jack surprised?', options: ['Prices are high', 'Locals have lunch late', 'Trains are slow', 'It rains a lot'], a: 1 },
        { q: 'When should he go to Montserrat?', options: ['In the afternoon', 'Early in the morning', 'At night', 'At the weekend'], a: 1 },
      ],
    },
    shadowing: [
      "It's the area where most tourists go.",
      'Gràcia, which is a bit further north, is much nicer.',
      "That's a bit of a culture shock.",
      'The views are absolutely breathtaking.',
      "Go early in the morning, when it's less crowded.",
      'The people who live there are really welcoming.',
    ],
    speaking: {
      prompt: 'Describe your city or region to a foreign visitor: places to go, food, customs and things to avoid.',
      prep: ['Two or three places off the beaten track (use relative clauses!).', 'Food and customs that might cause culture shock.', 'One thing visitors should avoid, and why.'],
      phrases: ["One place that I'd definitely recommend is…", "It's the kind of place where…", 'Something that surprises visitors is…', "Whatever you do, don't…"],
    },
    writing: {
      prompt: "Review of a place you've visited (a restaurant, hotel or city) for an international travel website.",
      words: [150, 200],
      useful: ['Located in…, this… is…', 'What struck me most was…', 'The only drawback was…', "I'd thoroughly recommend it to anyone who…"],
      checklist: ['A catchy title', 'At least 3 relative clauses (1 non-defining, with commas)', 'Positive and negative points', 'A clear recommendation at the end'],
      model: `A hidden gem in the Pyrenees

Located in a small village off the beaten track, Casa Lola is a family-run guesthouse that feels more like a home than a hotel. The owners, who have lived in the valley all their lives, welcomed us with a hospitality I'll never forget.

What struck me most was the food. Every evening, Lola cooks a set menu using vegetables which she grows in her own garden, and the lamb stew, which she served on our last night, was the best I've ever eaten. The rooms are simple but spotless, and the view from the terrace, where breakfast is served, is breathtaking.

The only drawback is that the village is hard to reach without a car, and there is no mobile coverage in some rooms — although, to be honest, that was part of the charm.

I'd thoroughly recommend Casa Lola to anyone who wants to disconnect and experience real mountain life.`,
    },
  },

  // ===================================================================
  {
    id: 'u6', emoji: '📰', title: 'Communication & Media', level: 'B2+',
    vocab: [
      { w: 'misleading', def: 'giving a wrong idea or impression', ex: 'The headline was completely misleading.' },
      { w: 'spread', def: 'to reach or affect more and more people', ex: 'Fake news spreads faster than the truth.' },
      { w: 'reliable', def: 'able to be trusted', ex: 'Is this source reliable?' },
      { w: 'fact-check', def: 'to check that the facts in something are correct', ex: 'Journalists should fact-check every claim.' },
      { w: 'bias', def: 'an unfair preference for or against one side', ex: 'Every newspaper has some political bias.' },
      { w: 'viral', def: '(of content) spreading very quickly online', ex: 'Her video went viral overnight.' },
      { w: 'clickbait', def: 'content designed mainly to make you click on a link', ex: "I'm tired of clickbait headlines." },
      { w: 'pointed out', def: 'mentioned something to draw attention to it (past of point out)', ex: 'She pointed out a mistake in the report.' },
      { w: 'echo chamber', def: 'a situation where you only hear opinions similar to your own', ex: 'Social media can become an echo chamber.' },
      { w: 'claims', def: 'says that something is true, often without proof (verb: claim)', ex: 'The company claims its product is the best.' },
    ],
    reading: {
      title: 'Inside the echo chamber',
      text: `When social media first appeared, many people believed it would make us better informed. For the first time, anyone could share news, and we would be exposed to a wider range of opinions than ever before. Twenty years later, the picture is much less optimistic.

The problem lies partly in the algorithms. Platforms are designed to keep us scrolling, so they show us content that provokes strong reactions. Researchers have found that false stories spread significantly faster than true ones, partly because they are more surprising and emotional. A misleading headline can go viral in minutes, while the correction, published hours later, reaches only a fraction of the audience.

At the same time, many users end up in echo chambers. Because we tend to follow people who think like us, and because algorithms recommend similar content, our feeds can confirm what we already believe. Over time, the other side begins to seem not just wrong but incomprehensible.

Not everyone agrees with this analysis. Some studies suggest that most people still get information from a variety of sources, and that echo chambers are smaller than is often claimed.

What almost everyone agrees on, however, is the importance of media literacy. Checking who wrote an article, looking for reliable sources, noticing emotional language and being suspicious of clickbait are skills that schools — and adults — can no longer afford to ignore.`,
      questions: [
        { q: 'What did people originally expect from social media?', options: ['Less information', 'To be better informed and exposed to more opinions', 'More advertising', 'Fewer news sources'], a: 1 },
        { q: 'Why do false stories spread faster?', options: ['They are shorter', 'They are more surprising and emotional', 'Experts write them', 'Algorithms block true stories'], a: 1 },
        { q: 'What is an echo chamber?', options: ['A place where you mostly see views similar to yours', 'A type of algorithm', 'A news website', 'A fact-checking tool'], a: 0 },
        { q: 'What do "some studies" suggest?', options: ['Echo chambers may be smaller than often claimed', 'Social media is perfect', 'Everyone reads only one source', 'Media literacy is useless'], a: 0 },
        { q: 'What does almost everyone agree on?', options: ['Social media should be banned', 'Media literacy is important', 'Clickbait is harmless', 'Algorithms are neutral'], a: 1 },
      ],
    },
    grammar: {
      title: 'Reported speech and reporting verbs',
      explain: [
        'Backshift when the reporting verb is in the past: *"I\'m tired"* → *She said (that) she was tired.* · *"I\'ve finished"* → *He said he had finished.* · *"I\'ll call"* → *She said she would call.*',
        'Time and place change: today → that day · tomorrow → the next day · here → there.',
        'Questions use normal word order (no *do*): *"Where do you work?"* → *He asked me where I worked.* Yes/no questions: *She asked if / whether I was ready.*',
        'C1 reporting verbs and their patterns: *suggest / recommend / deny / admit* + -ing · *refuse / agree / offer / promise* + to… · *warn / advise / remind / persuade* + someone + to… · *accuse* someone *of* + -ing · *apologise for* + -ing.',
      ],
      trap: '*suggest* nunca lleva "someone to": *He suggested going* / *He suggested that we go* (no *He suggested me to go*).',
      exercises: [
        { type: 'gap', q: '"I\'m working from home today." → She said she ___ from home that day.', a: ['was working'] },
        { type: 'gap', q: '"We have launched the product." → They said they ___ the product.', a: ['had launched'] },
        { type: 'fix', q: 'He asked me where did I live.', a: ['He asked me where I lived.'] },
        { type: 'choice', q: 'She ___ taking the money, but the camera showed her.', options: ['refused', 'denied', 'promised', 'offered'], a: 1 },
        { type: 'fix', q: 'My manager suggested me to take a break.', a: ['My manager suggested that I take a break.', 'My manager suggested that I should take a break.', 'My manager suggested taking a break.', 'My manager suggested I take a break.', 'My manager suggested I should take a break.'] },
        { type: 'gap', q: '"Don\'t forget to send the report." → He reminded me ___ the report.', a: ['to send'] },
        { type: 'choice', q: 'They accused him ___ the information.', options: ['to leak', 'of leaking', 'for leaking', 'leaking'], a: 1 },
        { type: 'gap', q: '"Are you coming?" → She asked me ___ I was coming.', a: ['if', 'whether'] },
      ],
    },
    listening: {
      title: 'A meeting recap',
      speakers: { A: 'Sara', B: 'David' },
      lines: [
        ['A', "How did the meeting with the client go? I couldn't make it."],
        ['B', "Better than expected. At first they said they weren't happy with the delays, but when I explained the reasons, they calmed down."],
        ['A', 'Did they mention the budget?'],
        ['B', 'Yes. They asked whether we could reduce the price by ten percent. I told them I would discuss it with you before promising anything.'],
        ['A', 'Good. Anything else?'],
        ['B', 'Their director suggested having weekly calls instead of monthly ones, and she recommended using a shared dashboard so everyone can see the progress.'],
        ['A', 'That sounds reasonable. Did they agree to extend the deadline?'],
        ['B', 'Not officially, but she admitted that the original deadline had been too ambitious.'],
      ],
      questions: [
        { q: 'How did the client feel at first?', options: ['Very happy', 'Unhappy about the delays', 'Angry about the price', 'Bored'], a: 1 },
        { q: 'What did the client ask about?', options: ['A ten percent price reduction', 'A new contract', 'Hiring more people', 'Cancelling the project'], a: 0 },
        { q: 'What did the director suggest?', options: ['Monthly calls', 'Weekly calls', 'No more meetings', 'An office visit'], a: 1 },
        { q: 'What did the director admit?', options: ['The deadline had been too ambitious', 'They had no budget', 'They preferred another supplier', 'The dashboard was useless'], a: 0 },
      ],
    },
    shadowing: [
      "They said they weren't happy with the delays.",
      'She asked whether we could reduce the price.',
      'I told them I would discuss it first.',
      'She suggested having weekly calls.',
      'He admitted that the deadline had been too ambitious.',
      'The headline was completely misleading.',
    ],
    speaking: {
      prompt: 'Retell a conversation or a piece of news you heard recently. Report what people said, asked and suggested.',
      prep: ['Who was involved, and where?', 'Report 3–4 things using different reporting verbs (claimed, admitted, suggested, warned…).', 'Your opinion: was it reliable?'],
      phrases: ['Apparently,…', 'According to…', 'She claimed that…', 'He went on to say that…', 'What surprised me was that…'],
    },
    writing: {
      prompt: "Summary of a meeting (or conversation) for someone who couldn't attend.",
      words: [130, 180],
      useful: ["Here's a quick summary of…", 'X pointed out that…', 'We agreed to…', 'Y suggested -ing…', 'Action points:'],
      checklist: ['Correct backshift', 'At least 4 different reporting verbs', 'Clear action points at the end', 'Neutral, professional tone'],
      model: `Subject: Summary of today's meeting with Delta Logistics

Hi Sara,

Here's a quick summary of the meeting, since you couldn't make it.

At the beginning, the client said they were unhappy with the recent delays. I explained that the problems had been caused by a supplier, and they accepted that. Their director pointed out that communication had not been clear enough, and she suggested having weekly calls instead of monthly ones. She also recommended using a shared dashboard.

They asked whether we could reduce the price by 10%. I told them I would discuss it with you before making any promises. Finally, the director admitted that the original deadline had been too ambitious, although she refused to change it officially for now.

Action points:
- Decide on the discount by Friday.
- Set up weekly calls (I'll send the invitation).
- Create the shared dashboard.

Best,
David`,
    },
  },

  // ===================================================================
  {
    id: 'u7', emoji: '🌍', title: 'Environment & Cities', level: 'C1',
    vocab: [
      { w: 'sustainable', def: 'able to continue for a long time without damaging the environment', ex: 'We need more sustainable transport.' },
      { w: 'emissions', def: 'gases released into the air, especially from cars and factories', ex: 'Cars are responsible for a large share of emissions.' },
      { w: 'tackle', def: 'to make a determined effort to deal with a problem', ex: 'The city is trying to tackle air pollution.' },
      { w: 'renewable', def: '(of energy) coming from sources that do not run out, like the sun or wind', ex: 'Spain generates a lot of renewable energy.' },
      { w: 'congestion', def: 'too much traffic in a place', ex: 'Congestion in the city centre is getting worse.' },
      { w: 'ban', def: 'to officially say that something is not allowed', ex: 'The council has decided to ban cars from the old town.' },
      { w: 'greenery', def: 'green plants and trees', ex: 'The new park added much-needed greenery to the area.' },
      { w: 'footprint', def: '(carbon) the amount of CO2 your activities produce', ex: 'Flying is the quickest way to increase your carbon footprint.' },
      { w: 'commute', def: 'to travel regularly between home and work', ex: 'I commute by bike every day.' },
      { w: 'affordable', def: 'cheap enough for most people to pay', ex: 'The city needs more affordable housing.' },
    ],
    reading: {
      title: 'The 15-minute city',
      text: `Imagine being able to reach your work, school, doctor, supermarket and a park within fifteen minutes of your home, on foot or by bike. This is the idea behind the "15-minute city", a concept developed by the urbanist Carlos Moreno and adopted by mayors from Paris to Melbourne.

Supporters argue that the model tackles several problems at once. If daily needs can be met locally, people commute less, congestion falls and emissions are reduced. Streets that were designed for cars can be given back to pedestrians, cyclists and greenery. It is also believed that the model strengthens communities, since neighbours are more likely to meet each other.

In Paris, dozens of streets near schools have been closed to traffic, and hundreds of kilometres of cycle lanes have been built. In Barcelona, the "superblocks" programme, in which groups of blocks are closed to through traffic, is said to have reduced noise and pollution significantly.

However, the idea has also been criticised. Some people fear that it will be used to restrict their freedom of movement — a claim that planners strongly reject. Others point out that it works best in dense, wealthy city centres, and that improving neighbourhoods can push up rents, making them less affordable for the people who already live there.

Most experts agree that the 15-minute city is not a magic solution. But as cities look for ways to become more sustainable, it offers a useful question: what do people really need close to home?`,
      questions: [
        { q: 'What is a "15-minute city"?', options: ['A city with fast trains', 'A place where daily needs are within 15 minutes of home', 'A city that closes at night', 'A car-free country'], a: 1 },
        { q: 'Which benefit is NOT mentioned?', options: ['Less congestion', 'Stronger communities', 'Cheaper electricity', 'Lower emissions'], a: 2 },
        { q: "What has Barcelona's superblocks programme reportedly done?", options: ['Increased traffic', 'Reduced noise and pollution', 'Built new motorways', 'Raised taxes'], a: 1 },
        { q: 'What is one criticism?', options: ['Improved neighbourhoods may become less affordable', 'It is too cheap', 'It only works in villages', 'It increases car use'], a: 0 },
      ],
    },
    grammar: {
      title: 'The passive and passive reporting',
      explain: [
        'Passive = *be* + past participle. Use it when the action matters more than who does it: *Hundreds of trees were planted last year.* / *The street is being repaired.* / *A new law has been approved.*',
        'Add the agent with *by* only when it is important: *The plan was designed by Carlos Moreno.*',
        'With modals: *It must be done by Friday.* / *It should have been finished earlier.*',
        'C1 — passive reporting (news and formal writing): *It is said / believed / thought that…* or *X is said to* + infinitive: *The plan is believed to have reduced pollution.* (past → *to have* + participle)',
        'Causative: *have / get something done*: *We had solar panels installed.*',
      ],
      trap: 'La pasiva refleja (*Se construyeron dos puentes*) en inglés es pasiva normal: *Two bridges were built* (no *It built two bridges*).',
      exercises: [
        { type: 'gap', q: 'A new cycle lane ___ (build) next year.', a: ['will be built', 'is going to be built'] },
        { type: 'gap', q: 'The old factory ___ (turn) into a park in 2019.', a: ['was turned'] },
        { type: 'fix', q: 'In my city it built a new stadium last year.', a: ['In my city a new stadium was built last year.', 'In my city, a new stadium was built last year.', 'A new stadium was built in my city last year.', 'They built a new stadium in my city last year.'] },
        { type: 'gap', q: 'The road ___ (repair) at the moment, so take another route.', a: ['is being repaired'] },
        { type: 'gap', q: 'It ___ (believe) that the project will cost €2 million.', a: ['is believed'] },
        { type: 'gap', q: 'The mayor is said ___ (resign) yesterday.', a: ['to have resigned'] },
        { type: 'choice', q: 'We ___ solar panels installed last summer.', options: ['did', 'had', 'made', 'were'], a: 1 },
        { type: 'gap', q: 'This problem should ___ (solve) years ago.', a: ['have been solved'] },
      ],
    },
    listening: {
      title: 'Local radio news',
      speakers: { A: 'Newsreader' },
      lines: [
        ['A', 'Good morning. Here is the local news.'],
        ['A', 'The city council has announced that cars will be banned from the old town from January. The decision was approved last night after a long debate. Residents will be given special permits, and delivery vans will be allowed in before 10 am.'],
        ['A', 'In other news, more than five hundred trees are being planted along the ring road this month, as part of a plan to add greenery and reduce noise. The project is expected to be completed by spring.'],
        ['A', 'Finally, public transport prices are to be reduced by twenty percent for young people under twenty-six. It is thought that the measure will encourage more people to commute by train and bus. The discount is said to have been proposed by a group of students last year.'],
      ],
      questions: [
        { q: 'When will cars be banned from the old town?', options: ['Next week', 'From January', 'In spring', "They won't be"], a: 1 },
        { q: 'Who will be allowed in?', options: ['Tourists', 'Residents with permits and early deliveries', 'All cars before 10 am', 'Taxis only'], a: 1 },
        { q: 'How many trees are being planted?', options: ['Fifty', 'More than five hundred', 'Twenty-six', 'Two thousand'], a: 1 },
        { q: 'Who reportedly proposed the transport discount?', options: ['The mayor', 'A group of students', 'Bus drivers', 'The train company'], a: 1 },
      ],
    },
    shadowing: [
      'Cars will be banned from the old town from January.',
      'More than five hundred trees are being planted.',
      'The project is expected to be completed by spring.',
      'It is thought that the measure will reduce traffic.',
      'The plan is said to have been a success.',
      'We had solar panels installed last summer.',
    ],
    speaking: {
      prompt: 'What are the biggest environmental problems in your city, and what should be done about them?',
      prep: ['Describe 2 problems (congestion, noise, housing…).', 'What has been done so far? (passive!)', 'What should be done? Give reasons.'],
      phrases: ['One of the biggest issues is…', 'A lot has been done to…', 'In my view, more should be done to…', 'It is often said that…, but…'],
    },
    writing: {
      prompt: 'C1 Proposal: suggest one improvement to make your neighbourhood more sustainable.',
      words: [180, 230],
      useful: ['The aim of this proposal is to…', 'At present,…', 'It is recommended that…', 'This could be funded by…', 'In conclusion,…'],
      checklist: ['Headings (Introduction / Current situation / Recommendation / Conclusion)', 'At least 4 passive forms', 'Formal register, no contractions', 'Benefits clearly explained'],
      model: `Proposal: More green space in Sant Martí

Introduction
The aim of this proposal is to suggest a practical way of making our neighbourhood more sustainable and pleasant to live in.

Current situation
At present, most streets are dominated by cars, and there is very little greenery. Air pollution is high, and children have few safe places to play. Several surveys have been carried out, and residents consistently mention noise and a lack of parks as their main concerns.

Recommendation
It is recommended that two of the quieter streets near the school should be closed to through traffic and converted into green areas with trees, benches and a small playground. Parking spaces could be relocated to an underground car park, which is currently underused. The project could be funded partly by the city council and partly by European sustainability grants.

Conclusion
If these measures were implemented, emissions and noise would be reduced, and residents would gain a valuable meeting space. It is believed that similar projects in other districts have increased local well-being significantly.`,
    },
  },

  // ===================================================================
  {
    id: 'u8', emoji: '🤝', title: 'Leadership & Negotiation', level: 'C1',
    vocab: [
      { w: 'persuade', def: 'to make someone agree to do or believe something', ex: 'She managed to persuade the board to approve the budget.' },
      { w: 'leverage', def: 'power or an advantage that helps you get what you want', ex: 'We have very little leverage in this negotiation.' },
      { w: 'win-win', def: 'good for everyone involved', ex: "We're looking for a win-win solution." },
      { w: 'concede', def: 'to admit that something is true, or to give something up', ex: 'In the end, they had to concede a small discount.' },
      { w: 'bottom line', def: 'the most important fact; or the lowest price you will accept', ex: "The bottom line is that we can't go below €50." },
      { w: 'empower', def: 'to give people the confidence and authority to act', ex: 'Good leaders empower their teams.' },
      { w: 'accountable', def: 'responsible for your decisions and actions', ex: 'Everyone on the team is accountable for the results.' },
      { w: 'compromise', def: 'to accept less than you wanted in order to reach an agreement', ex: 'In the end, both sides had to compromise.' },
      { w: 'feedback', def: 'comments about how well someone is doing something', ex: 'Constructive feedback helps people grow.' },
      { w: 'step down', def: 'to leave an important job or position', ex: 'The CEO decided to step down after ten years.' },
    ],
    reading: {
      title: 'What makes a great negotiator?',
      text: `Most people imagine a great negotiator as someone tough and aggressive — a person who never gives an inch and always gets the best deal. Research, however, paints a very different picture.

In a famous study of professional negotiators, the most successful ones spent far more time asking questions and listening than their average colleagues. Rather than focusing on their own position, they tried to understand what the other side really needed. Only when they understood those needs did they make proposals.

This matters because the most successful agreements are rarely about a single issue. A supplier who cannot lower the price might be able to offer faster delivery, longer payment terms or extra services. What skilled negotiators look for, in other words, is a win-win solution in which both sides gain something they value.

Preparation is equally important. Before any serious negotiation, good negotiators know exactly what their bottom line is — the point at which they will walk away. Knowing your alternatives gives you leverage: the better your alternative, the less pressure you feel to accept a bad deal.

Finally, great negotiators think about the relationship, not just the deal. It is often the same people you will have to work with next year. Never should short-term gains come at the cost of long-term trust. As one experienced negotiator put it, "It's not what you win today that matters; it's whether they still want to work with you tomorrow."`,
      questions: [
        { q: 'What did the study find about successful negotiators?', options: ['They were more aggressive', 'They asked more questions and listened more', 'They talked more', 'They made proposals immediately'], a: 1 },
        { q: 'Why are good agreements "rarely about a single issue"?', options: ['There are many ways to create value beyond price', "Price doesn't matter", 'Suppliers are dishonest', 'Negotiations are short'], a: 0 },
        { q: 'What gives you leverage, according to the text?', options: ['Being aggressive', 'Having good alternatives', 'Talking loudly', 'Lowering your price'], a: 1 },
        { q: 'What is your "bottom line"?', options: ['Your first offer', 'The point at which you will walk away', 'The last page of a contract', "The other side's needs"], a: 1 },
        { q: 'What is the main idea of the last paragraph?', options: ['Relationships and trust matter more than a single win', 'Always win today', 'Never negotiate twice', 'Trust is not important'], a: 0 },
      ],
    },
    grammar: {
      title: 'Emphasis: cleft sentences and inversion',
      explain: [
        '*Cleft sentences* move the focus to the key information: *What we need is more time.* / *It was the CEO who made the decision.* / *The reason why I called is…* / *All I want is a fair deal.*',
        '*Inversion* after negative or limiting expressions at the start (formal and powerful): *Never have I seen such a good offer.* / *Not only did they lower the price, but they also improved delivery.* / *Only when we understood their needs did we make a proposal.* / *Under no circumstances should you accept the first offer.* / *Rarely do we get a chance like this.*',
        'Conditional inversion: *Had we known* = If we had known · *Should you need* = If you need · *Were we to accept* = If we accepted.',
        'After inversion, use question word order: auxiliary + subject + verb.',
      ],
      trap: 'No te pases: la inversión suena muy formal. Úsala en presentaciones, textos escritos y exámenes, no en una charla con amigos.',
      exercises: [
        { type: 'gap', q: 'What I really need ___ a holiday.', a: ['is'] },
        { type: 'choice', q: 'Never ___ such a difficult client.', options: ['I have met', 'have I met', 'I met', 'did I met'], a: 1 },
        { type: 'fix', q: 'Not only they lowered the price, but they also offered free delivery.', a: ['Not only did they lower the price, but they also offered free delivery.', 'Not only did they lower the price, they also offered free delivery.', 'Not only did they lower the price but they also offered free delivery.'] },
        { type: 'gap', q: 'It was Maria ___ closed the deal.', a: ['who', 'that'] },
        { type: 'choice', q: 'Under no circumstances ___ share this information.', options: ['you should', 'should you', 'you must', 'do you'], a: 1 },
        { type: 'gap', q: '___ we known about the problem, we would have acted sooner.', a: ['Had'] },
        { type: 'fix', q: 'Only when I read the contract I understood the problem.', a: ['Only when I read the contract did I understand the problem.'] },
        { type: 'choice', q: '___ you need any further information, please contact me.', options: ['If you', 'Should', 'Would', 'Had'], a: 1 },
      ],
    },
    listening: {
      title: 'A salary negotiation',
      speakers: { A: 'Helen (manager)', B: 'Alex (employee)' },
      lines: [
        ['B', "Thanks for making time, Helen. I'd like to talk about my salary."],
        ['A', 'Of course. What did you have in mind?'],
        ['B', "Over the past year, I've taken on the Madrid account and my team has grown from three to seven people. What I'm asking for is a salary that reflects that responsibility — around fifteen percent more."],
        ['A', "I understand, and I agree you've done excellent work. The problem is that the budget for this year is already closed. Fifteen percent is simply not possible right now."],
        ['B', 'I see. What could be possible?'],
        ['A', 'I could offer five percent now, and review it again in six months. I could also approve the leadership course you asked about.'],
        ['B', "That's helpful. Would you be willing to put the six-month review in writing, with clear objectives?"],
        ['A', "Yes, that's fair. Let's agree on the objectives next week."],
      ],
      questions: [
        { q: 'Why does Alex ask for a raise?', options: ['More responsibility and a bigger team', 'Inflation', 'Another job offer', 'Working weekends'], a: 0 },
        { q: "Why can't Helen offer 15%?", options: ["Alex's work is poor", 'The budget is already closed', 'The company is closing', 'HR said no'], a: 1 },
        { q: 'What does Helen offer?', options: ['Nothing', '5% now, a review in six months and a course', '15% next year', 'A company car'], a: 1 },
        { q: 'What does Alex ask for at the end?', options: ['More money immediately', 'The review in writing, with objectives', 'A holiday', 'A new manager'], a: 1 },
      ],
    },
    shadowing: [
      "What I'm asking for is a salary that reflects my responsibility.",
      'Not only did they lower the price, but they also improved delivery.',
      'Never have I seen such a good offer.',
      'Would you be willing to put that in writing?',
      "We're looking for a win-win solution.",
      "The bottom line is that we can't go any lower.",
    ],
    speaking: {
      prompt: 'Role-play: negotiate something you want (a raise, a better price, a day off). Present your case, respond to objections and propose alternatives.',
      prep: ['Your goal and your bottom line.', 'Two strong arguments, with facts.', 'Two alternatives you could accept (win-win).'],
      phrases: ["What I'd like to propose is…", 'I understand your position, but…', 'Would you be willing to…?', 'If you could…, we could…', "Let's see if we can find a middle ground."],
    },
    writing: {
      prompt: "C1 Essay: 'Good leaders are born, not made.' Discuss both views and give your opinion.",
      words: [220, 260],
      useful: ['It is often claimed that…', 'Not only…, but…', 'What is clear is that…', 'Admittedly,…', 'On balance,…'],
      checklist: ['Introduction that paraphrases the question', 'One paragraph for each side', 'At least 1 inversion and 1 cleft sentence', 'Conclusion with your clear opinion', 'Formal register, no contractions'],
      model: `It is often claimed that some people are natural leaders, while others will never be able to lead, however hard they try. Although personality clearly plays a role, I believe that leadership is, above all, a skill that can be learned.

Admittedly, certain traits seem to come naturally to some individuals. Confidence, energy and the ability to communicate are often visible from a young age, and people who possess them may find it easier to be noticed and promoted. Supporters of this view argue that such qualities cannot simply be taught in a course.

However, what research consistently shows is that the most effective leaders are not necessarily the most charismatic. Not only do successful leaders listen carefully, but they also give constructive feedback, delegate effectively and hold themselves accountable. These are behaviours, and behaviours can be practised and improved. Indeed, many respected managers describe themselves as shy people who had to learn to speak in public.

On balance, it seems to me that natural talent may provide a head start, but it is experience, reflection and a willingness to learn that turn someone into a good leader. Only by empowering people to develop these skills will organisations find the leaders they need.`,
    },
  },
];

// ---------------------------------------------------------------------
// TEST DE NIVEL (orientativo, dificultad creciente B1 → C1)
// ---------------------------------------------------------------------
const PLACEMENT = [
  { q: 'She ___ in Madrid since 2018.', options: ['lives', 'has lived', 'is living', 'lived'], a: 1 },
  { q: 'If it rains tomorrow, we ___ at home.', options: ['stay', 'will stay', 'would stay', 'stayed'], a: 1 },
  { q: "I'm not used to ___ up so early.", options: ['get', 'getting', 'got', 'have got'], a: 1 },
  { q: 'He asked me where ___.', options: ['do I work', 'I worked', 'did I work', 'I am work'], a: 1 },
  { q: "You ___ smoke here. It's forbidden.", options: ["don't have to", "mustn't", "needn't", "shouldn't have"], a: 1 },
  { q: 'By the time we arrived, the film ___.', options: ['started', 'has started', 'had started', 'was starting'], a: 2 },
  { q: 'Can you ___ me a favour?', options: ['make', 'do', 'give', 'take'], a: 1 },
  { q: 'I wish I ___ more time to study.', options: ['have', 'had', 'would have', 'will have'], a: 1 },
  { q: 'The report ___ by the manager yesterday.', options: ['wrote', 'was written', 'has written', 'is writing'], a: 1 },
  { q: "She ___ have seen us; she was looking the other way.", options: ["can't", "mustn't", "shouldn't", "wouldn't"], a: 0 },
  { q: 'If I had known, I ___ you.', options: ['would tell', 'would have told', 'had told', 'will tell'], a: 1 },
  { q: '___ the bad weather, the event was a success.', options: ['Although', 'Despite', 'However', 'Even'], a: 1 },
  { q: 'The meeting has been ___ until next week.', options: ['put off', 'put up', 'put out', 'put on'], a: 0 },
  { q: "She's very ___ to criticism; she gets upset easily.", options: ['sensible', 'sensitive', 'sensitivity', 'senseless'], a: 1 },
  { q: 'He denied ___ the documents.', options: ['to take', 'taking', 'take', 'that take'], a: 1 },
  { q: "It's high time we ___ home.", options: ['go', 'went', 'will go', 'have gone'], a: 1 },
  { q: 'What I need ___ a good night\'s sleep.', options: ['are', 'is', 'be', 'being'], a: 1 },
  { q: 'The results were good; ___, there is room for improvement.', options: ['moreover', 'nonetheless', 'therefore', 'whereas'], a: 1 },
  { q: 'Not only ___ late, but he also forgot the slides.', options: ['he was', 'was he', 'he is', 'did he'], a: 1 },
  { q: 'The company is thought ___ record profits last year.', options: ['to make', 'to have made', 'making', 'that made'], a: 1 },
  { q: '___ you need any help, don\'t hesitate to call.', options: ['Should', 'Would', 'Had', 'Were'], a: 0 },
  { q: 'Hardly ___ sat down when the phone rang.', options: ['I had', 'had I', 'I have', 'did I'], a: 1 },
  { q: 'Had I realised how difficult it was, I ___.', options: ["wouldn't have started", "won't start", "didn't start", "hadn't started"], a: 0 },
  { q: 'The proposal met ___ strong opposition from the board.', options: ['to', 'with', 'by', 'against'], a: 1 },
];
function placementLevel(score, total) {
  const p = score / total;
  if (p >= 0.84) return 'C1';
  if (p >= 0.63) return 'B2+';
  if (p >= 0.38) return 'B2';
  return 'B1';
}
