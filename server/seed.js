import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin, Trainer, Course, Student, Attendance } from './models.js';

const javaTopics = [
  'Introduction to Java','Java Environment Setup','Java Syntax','Variables and Data Types','Operators','Conditional Statements','Loops','Arrays','Strings','Methods','OOP Concepts','Classes and Objects','Constructors','Inheritance','Polymorphism','Abstraction','Encapsulation','Interfaces','Exception Handling','Collections','List Set Map','Generics','File Handling','Java 8 Features','Streams','Lambda Expressions','Multithreading','JDBC','SQL with Java','Mini Project'
];

const pythonTopics = [
  'Introduction to Python','Installation and Environment','Python Syntax','Variables','Data Types','Operators','Conditional Statements','Loops','Strings','Lists','Tuples','Sets','Dictionaries','Functions','Lambda Functions','Modules','Packages','Exception Handling','File Handling','OOP','Classes','Inheritance','Polymorphism','Encapsulation','Iterators','Generators','Decorators','JSON','APIs','Mini Project'
];

const mernTopics = [
  'MongoDB Introduction','Database and Collections','MongoDB CRUD','MongoDB Queries','MongoDB Operators','Schema Design','Indexing','Aggregation','MongoDB with Node.js','MongoDB Project','Express Introduction','Express Project Setup','Routing','Middleware','REST APIs','Controllers','Error Handling','Validation','Authentication','Express API Project','React Introduction','Components','JSX','Props','State','Events','Forms','useState','useEffect','React Router','Context API','Custom Hooks','API Integration','Redux Toolkit','React Project','Node.js Introduction','Node Modules','NPM','File System','Async Programming','Promises','Async Await','HTTP','Environment Variables','Authentication','JWT Concepts','Backend Architecture','Deployment','Full Stack Integration','MERN Final Project'
];

const questionSets = {
  'Introduction to Java': ['What is Java and where is it used?','What are the main features of Java?','Why is Java platform independent?','What is the difference between JDK, JRE and JVM?','How does a Java program execute?'],
  'Java Environment Setup': ['How do you install the JDK?','How do you verify a Java installation?','What is JAVA_HOME?','How do you compile a Java program from the terminal?','What IDEs are commonly used for Java development?'],
  'Variables and Data Types': ['What is a variable in Java?','What are primitive data types in Java?','What is the difference between int and Integer?','What is type casting?','What is variable scope?'],
  'OOP Concepts': ['What are the four pillars of OOP?','Why is encapsulation important?','What is inheritance?','What is polymorphism?','What is abstraction?'],
  'Classes and Objects': ['What is a class in Java?','What is an object?','How do you create an object?','What is the difference between a class and an object?','Can a class contain multiple methods?'],
  'Inheritance': ['What is inheritance in Java?','What is single inheritance?','Why does Java not support multiple class inheritance?','What is the super keyword?','When should inheritance be preferred over composition?'],
  'Polymorphism': ['What is polymorphism?','What is method overloading?','What is method overriding?','What is runtime polymorphism?','What is compile-time polymorphism?'],
  'Exception Handling': ['What is an exception?','What is the difference between checked and unchecked exceptions?','How do try, catch and finally work?','What is the purpose of throw and throws?','How do you create a custom exception?'],
  'Collections': ['What is the Java Collections Framework?','What is the difference between Collection and Collections?','When would you use an ArrayList?','When would you use a HashSet?','When would you use a HashMap?'],
  'Streams': ['What is a Java Stream?','What is the difference between map and filter?','What does collect do?','Are streams reusable?','When should streams be avoided?'],
  'Lambda Expressions': ['What is a lambda expression?','What is a functional interface?','How does a lambda improve Java code?','What is the syntax of a lambda?','Give one practical use of a lambda expression.'],
  'Multithreading': ['What is a thread?','How do you create a thread in Java?','What is thread synchronization?','What is a race condition?','What is the difference between Runnable and Thread?'],
  'JDBC': ['What is JDBC?','What are the steps to connect Java to a database?','What is a PreparedStatement?','Why should PreparedStatement be preferred?','How do you close JDBC resources safely?'],
  'Mini Project': ['How would you plan a Java mini project?','How would you structure the project packages?','How would you validate user input?','How would you persist application data?','How would you test and deploy the project?'],

  'Introduction to Python': ['What is Python and where is it used?','What are the main features of Python?','Why is Python dynamically typed?','What is the Python interpreter?','What is PEP 8?'],
  'Installation and Environment': ['How do you install Python?','How do you verify the Python version?','What is a virtual environment?','Why should projects use virtual environments?','How do you activate a virtual environment?'],
  'Data Types': ['What are the built-in Python data types?','What is the difference between mutable and immutable objects?','What is None?','How do you check a value type?','What is type conversion?'],
  'Functions': ['What is a function in Python?','What are parameters and arguments?','What is a default argument?','What does return do?','What is a keyword argument?'],
  'Lambda Functions': ['What is a lambda function?','When should lambda be used?','How is lambda different from def?','Can lambda contain multiple statements?','Give a practical lambda example.'],
  'Exception Handling': ['How does try-except work?','What is finally used for?','How do you raise an exception?','How do you create a custom exception?','Why should exceptions be handled specifically?'],
  'File Handling': ['How do you open a file in Python?','What is the difference between read and write modes?','Why is the with statement recommended?','How do you read a file line by line?','How do you handle file errors?'],
  'OOP': ['What is object-oriented programming in Python?','What is a class?','What is an object?','What is inheritance?','What is polymorphism?'],
  'Classes': ['How do you define a Python class?','What is __init__?','What is self?','How do instance methods work?','What is a class variable?'],
  'Inheritance': ['How does inheritance work in Python?','What is method overriding?','What does super() do?','What is multiple inheritance?','When should inheritance be used?'],
  'Iterators': ['What is an iterator?','What does __iter__ do?','What does __next__ do?','How does a for loop use iterators?','What exception ends iteration?'],
  'Generators': ['What is a generator?','What does yield do?','How are generators memory efficient?','What is the difference between yield and return?','When should generators be used?'],
  'Decorators': ['What is a decorator?','How does a decorator wrap a function?','What is @decorator syntax?','Where are decorators useful?','Can decorators accept arguments?'],
  'JSON': ['What is JSON?','How do you convert Python data to JSON?','How do you parse JSON?','What Python module is used for JSON?','How should invalid JSON be handled?'],
  'APIs': ['What is a REST API?','How do you call an API from Python?','What are HTTP methods?','How should API errors be handled?','What is JSON commonly used for in APIs?'],

  'MongoDB Introduction': ['What is MongoDB?','Why is MongoDB called a document database?','What is BSON?','When is MongoDB a good choice?','How does MongoDB differ from a relational database?'],
  'Database and Collections': ['What is a MongoDB database?','What is a collection?','What is a document?','How do you create a collection?','How are collections different from SQL tables?'],
  'MongoDB CRUD': ['What does CRUD mean?','How do you insert a MongoDB document?','How do you find documents?','How do you update a document?','How do you delete a document?'],
  'MongoDB Queries': ['How do you filter MongoDB documents?','What is findOne?','How do you sort query results?','How do you limit results?','How do you select specific fields?'],
  'MongoDB Operators': ['What are MongoDB query operators?','What does $in do?','What does $or do?','What does $gt do?','What does $set do?'],
  'Schema Design': ['What is schema design in MongoDB?','When should documents be embedded?','When should documents be referenced?','What is data duplication in MongoDB?','How do you design for common query patterns?'],
  'Indexing': ['What is a MongoDB index?','Why do indexes improve read performance?','What is a compound index?','What is the cost of too many indexes?','How do you inspect query performance?'],
  'Aggregation': ['What is the MongoDB aggregation pipeline?','What does $match do?','What does $group do?','What does $lookup do?','When should aggregation be used?'],
  'MongoDB with Node.js': ['How do you connect Node.js to MongoDB?','What is Mongoose?','What is a Mongoose schema?','How do you handle database connection errors?','How do you query MongoDB using Mongoose?'],
  'Express Introduction': ['What is Express.js?','Why is Express used with Node.js?','How do you create an Express application?','What is app.listen?','How do Express routes work?'],
  'Express Project Setup': ['How do you initialize an Express project?','What is package.json?','How do you load environment variables?','How should an Express project be structured?','How do you start an Express server?'],
  'Routing': ['What is routing in Express?','What is the difference between GET and POST routes?','What are route parameters?','What are query parameters?','How do you organize routes into modules?'],
  'Middleware': ['What is Express middleware?','What are application-level middlewares?','What is next()?','How do you create error middleware?','Where should authentication middleware be placed?'],
  'REST APIs': ['What is REST?','What are common REST HTTP methods?','What status code represents a successful creation?','How should REST endpoints be named?','What is the difference between PUT and PATCH?'],
  'Controllers': ['What is a controller?','Why separate controllers from routes?','How should controller errors be handled?','How do controllers access request data?','What makes a controller maintainable?'],
  'Error Handling': ['How should errors be handled in Express?','What is an error-handling middleware?','Why should stack traces not be exposed in production?','How should validation errors be returned?','What is a consistent API error response?'],
  'Validation': ['Why is server-side validation necessary?','What is schema validation?','How can request bodies be validated?','What should happen when validation fails?','Why should client validation not be trusted alone?'],
  'Authentication': ['What is authentication?','What is the difference between authentication and authorization?','Where should passwords be hashed?','Why should passwords never be stored as plain text?','How can sessions be used for authentication?'],
  'React Introduction': ['What is React?','Why is React component based?','What is JSX?','What is the virtual DOM?','Why is React useful for SPAs?'],
  'Components': ['What is a React component?','What is the difference between function and class components?','How do components receive data?','Why should components be reusable?','What is component composition?'],
  'JSX': ['What is JSX?','Why must JSX return one parent element?','How do you embed JavaScript in JSX?','How are class names written in JSX?','Can JSX contain conditional expressions?'],
  'Props': ['What are props?','Are props mutable?','How do you pass data from parent to child?','How do you pass a callback as a prop?','What is prop drilling?'],
  'State': ['What is state in React?','Why should state not be mutated directly?','How does state update trigger rendering?','When should state be lifted?','What is derived state?'],
  'Events': ['How are events handled in React?','What is an event handler?','How do you pass arguments to a handler?','What is event.preventDefault()?','How are React events different from native events?'],
  'Forms': ['How do controlled forms work in React?','How do you handle input changes?','How do you validate a form?','How do you submit a form?','When would you use an uncontrolled input?'],
  'useState': ['What does useState return?','How do you update state based on previous state?','Can a component have multiple useState calls?','Why should state updates be immutable?','When should state be moved to a parent?'],
  'useEffect': ['What is useEffect used for?','What does the dependency array control?','How do you clean up an effect?','What causes an effect to rerun?','When should you avoid useEffect?'],
  'React Router': ['What is React Router?','How do you define a route?','What is a nested route?','How do you navigate programmatically?','How do you protect a route?'],
  'Context API': ['What problem does Context solve?','How do you create a context?','What is a Provider?','How does useContext work?','When should Context be avoided?'],
  'Custom Hooks': ['What is a custom hook?','Why must hook names start with use?','How can a custom hook reuse logic?','Can a custom hook use other hooks?','Give an example of a useful custom hook.'],
  'API Integration': ['How do you call an API from React?','Where should API loading state be stored?','How should API errors be displayed?','Why should API logic be separated from UI components?','How can authenticated requests include credentials?'],
  'Redux Toolkit': ['What is Redux Toolkit?','What is a slice?','What is a reducer?','What is createAsyncThunk?','When is Redux useful?'],
  'Node.js Introduction': ['What is Node.js?','Why is Node.js useful for APIs?','What is the event loop?','Is Node.js single threaded?','Where is Node.js commonly used?'],
  'Node Modules': ['What is a Node.js module?','What is import/export?','What is CommonJS?','How do modules help project structure?','How do you create a local module?'],
  'NPM': ['What is npm?','What is package.json?','What is package-lock.json?','What is the difference between dependencies and devDependencies?','How do you install a package?'],
  'File System': ['What is the Node fs module?','How do you read a file asynchronously?','How do you write a file?','Why prefer asynchronous file APIs in servers?','How should file errors be handled?'],
  'Async Programming': ['What is asynchronous programming?','Why is async programming important in Node.js?','What is callback hell?','How do promises improve async code?','What is an event-driven architecture?'],
  'Promises': ['What is a Promise?','What are pending, fulfilled and rejected states?','How does then work?','How does catch work?','How can multiple promises be coordinated?'],
  'Async Await': ['What does async do?','What does await do?','How should errors be handled with async/await?','Can await be used outside an async function?','Why is async/await easier to read?'],
  'HTTP': ['What is HTTP?','What is the difference between HTTP and HTTPS?','What are common HTTP status codes?','What are request headers?','What is a request body?'],
  'Environment Variables': ['Why use environment variables?','How do you load environment variables in Node.js?','Which values should never be committed to Git?','How should production secrets be configured?','What is the difference between development and production configuration?'],
  'JWT Concepts': ['What is a JWT?','What are the three parts of a JWT?','Where should a server verify a JWT?','What is token expiration?','What are risks of storing tokens insecurely?'],
  'Backend Architecture': ['What are common layers in a Node.js backend?','Why separate routes and controllers?','What is service-layer logic?','How should database access be organized?','What makes an API maintainable?'],
  'Deployment': ['What is deployment?','What environment variables are needed in production?','Why should CORS be configured?','How do you serve a production React build?','How should logs be monitored in production?'],
  'Full Stack Integration': ['How does React communicate with Express?','How does Express communicate with MongoDB?','How should authentication flow across the stack?','How do you handle CORS between frontend and backend?','How do you structure a full-stack feature end to end?'],
  'MERN Final Project': ['How would you plan a MERN application?','How would you design the MongoDB collections?','How would you build and validate the API?','How would you protect authenticated routes?','How would you deploy and test the complete project?']
};

const fallbackQuestions = (title) => [
  `What is ${title}?`,
  `Why is ${title} important in real projects?`,
  `What are the main concepts of ${title}?`,
  `Give one practical example of ${title}.`,
  `What are common mistakes when working with ${title}?`
];

const makeTopics = (titles) => titles.map((title) => ({
  title,
  summary: `Practical ${title} concepts, examples and developer best practices.`,
  questions: (questionSets[title] || fallbackQuestions(title)).slice(0, 5).map((question) => ({ question }))
}));

const trainersData = [
  { name: 'Nandha', designation: 'Java / Spring Boot Trainer', experience: '7+ Years', specialization: 'Java, Spring Boot, React', description: 'Industry-focused trainer with practical project experience.', email: 'nandha@techlearn.com', phoneNumber: '+91 90000 10001', profileImage: '' },
  { name: 'Arun Kumar', designation: 'Python Trainer', experience: '6+ Years', specialization: 'Python, Django, Flask', description: 'Python trainer focused on backend development and practical applications.', email: 'arun@techlearn.com', phoneNumber: '+91 90000 10002', profileImage: '' },
  { name: 'Priya', designation: 'Testing Trainer', experience: '6+ Years', specialization: 'Selenium, Manual Testing', description: 'Hands-on testing mentor focused on real-world QA workflows.', email: 'priya@techlearn.com', phoneNumber: '+91 90000 10003', profileImage: '' },
  { name: 'Karthik', designation: 'MERN Stack Trainer', experience: '5+ Years', specialization: 'MongoDB, Express, React, Node', description: 'Full-stack developer and trainer for production-ready MERN applications.', email: 'karthik@techlearn.com', phoneNumber: '+91 90000 10004', profileImage: '' },
  { name: 'Ramesh', designation: 'DSA Trainer', experience: '8+ Years', specialization: 'Data Structures, Algorithms', description: 'Problem-solving mentor for coding interviews and fundamentals.', email: 'ramesh@techlearn.com', phoneNumber: '+91 90000 10005', profileImage: '' },
  { name: 'Sarah Taylor', designation: 'UI/UX Trainer', experience: '5+ Years', specialization: 'UI/UX, Design Systems', description: 'Design mentor helping students build clean and usable digital products.', email: 'sarah@techlearn.com', phoneNumber: '+91 90000 10006', profileImage: '' }
];

const courseDefinitions = [
  ['Java', 'java', '☕', javaTopics],
  ['Python', 'python', '🐍', pythonTopics],
  ['MERN Stack', 'mern', '⚛️', mernTopics]
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove indexes left behind by older versions of the project.
  // The current Student schema does not contain userId or a unique phoneNumber.
  const studentIndexes = await Student.collection.indexes();
  for (const index of studentIndexes) {
    if (index.name === 'userId_1' || index.name === 'phoneNumber_1') {
      await Student.collection.dropIndex(index.name);
      console.log(`Removed obsolete Student index: ${index.name}`);
    }
  }

  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminHash = await bcrypt.hash(adminPassword, 12);
  await Admin.findOneAndUpdate(
    { username: adminUsername },
    { username: adminUsername, passwordHash: adminHash, role: 'admin' },
    { upsert: true, new: true }
  );

  const trainers = [];
  for (const data of trainersData) {
    const trainer = await Trainer.findOneAndUpdate(
      { email: data.email }, data, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    trainers.push(trainer);
  }

  const courses = [];
  for (const [name, slug, icon, topics] of courseDefinitions) {
    // Find by either unique key so the seed remains safe if an older database
    // contains the same course name with a different slug.
    let course = await Course.findOne({ $or: [{ slug }, { name }] });
    const payload = {
      name,
      slug,
      description: `Complete ${name} developer training with practical topics and five task questions per topic.`,
      icon,
      topics: makeTopics(topics),
    };

    if (course) {
      course.set(payload);
      await course.save();
    } else {
      course = await Course.create(payload);
    }
    courses.push(course);
  }

  const demoPasswordHash = await bcrypt.hash('Student@123', 12);
  const demoStudents = [
    { name: 'Rahul Kumar', email: 'rahul@student.com', phoneNumber: '+91 9876543210', location: 'Coimbatore', courseId: courses[0]._id, preferredTiming: '09:00 AM - 11:00 AM', joiningDate: new Date('2026-08-01'), trainerId: trainers[0]._id, status: 'approved' },
    { name: 'Amit Singh', email: 'amit@student.com', phoneNumber: '+91 9876543211', location: 'Chennai', courseId: courses[0]._id, preferredTiming: '11:30 AM - 01:30 PM', joiningDate: new Date('2026-08-05'), trainerId: trainers[0]._id, status: 'approved' },
    { name: 'Priya Sharma', email: 'priya.student@student.com', phoneNumber: '+91 9876543212', location: 'Madurai', courseId: courses[1]._id, preferredTiming: '02:00 PM - 04:00 PM', joiningDate: new Date('2026-08-10'), trainerId: trainers[1]._id, status: 'approved' },
    { name: 'Neha Verma', email: 'neha@student.com', phoneNumber: '+91 9876543213', location: 'Tiruppur', courseId: courses[2]._id, preferredTiming: '05:00 PM - 07:00 PM', joiningDate: new Date('2026-08-12'), trainerId: trainers[3]._id, status: 'approved' },
    { name: 'Rohit Patel', email: 'rohit@student.com', phoneNumber: '+91 9876543214', location: 'Bangalore', courseId: courses[2]._id, preferredTiming: '07:00 PM - 09:00 PM', joiningDate: new Date('2026-08-15'), trainerId: trainers[3]._id, status: 'approved' },
    { name: 'Anitha M', email: 'anitha@student.com', phoneNumber: '+91 9876543215', location: 'Tiruppur', courseId: courses[2]._id, preferredTiming: '05:00 PM - 07:00 PM', joiningDate: new Date('2026-08-20'), trainerId: trainers[3]._id, status: 'pending' }
  ];

  const students = [];
  for (const data of demoStudents) {
    const student = await Student.findOneAndUpdate(
      { email: data.email },
      { ...data, passwordHash: demoPasswordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    students.push(student);
  }

  await Attendance.deleteMany({ reviewedBy: 'SEED_DATA' });
  const attendance = [];
  for (let day = 1; day <= 5; day++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - day);
    for (const student of students.slice(0, 5)) {
      attendance.push({
        studentId: student._id,
        courseId: student.courseId,
        trainerId: student.trainerId,
        attendanceDate: date,
        topicsCovered: student.courseId.toString() === courses[0]._id.toString() ? 'OOP Concepts and Classes' : student.courseId.toString() === courses[1]._id.toString() ? 'Functions and Exception Handling' : 'React Components and API Integration',
        classStartTime: '09:00',
        classEndTime: '11:00',
        status: day === 3 && student.name === 'Rohit Patel' ? 'absent' : 'present',
        reviewedBy: 'SEED_DATA'
      });
    }
  }
  if (attendance.length) await Attendance.insertMany(attendance);

  console.log('Seed complete.');
  console.log(`Admin: ${adminUsername} / ${adminPassword}`);
  console.log('Demo approved student: rahul@student.com / Student@123');
  console.log('Demo pending student: anitha@student.com / Student@123');
  console.log(`Courses: ${courses.map((c) => `${c.name} (${c.topics.length} topics)`).join(', ')}`);
  console.log(`Questions per topic: 5`);
  console.log(`Demo attendance records: ${attendance.length}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
