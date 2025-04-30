import React, { useState } from "react";
import { Link } from 'react-router-dom';
import MainLayout from "@/layouts/MainLayout";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const questions: Question[] = [
  {
    question: "தமிழின் மிகத் தொன்மையான இலக்கண நூல் எது?",
    options: ["நன்னூல்", "தொல்காப்பியம்", "வீரசோழியம்", "அகத்தியம்"],
    correctAnswer: "தொல்காப்பியம்",
  },
  {
    question: "எட்டுத்தொகை நூல்களில் அகத்திணை சார்ந்த மிக முக்கியமான நூல் எது?",
    options: ["புறநானூறு", "பதிற்றுப்பத்து", "அகநானூறு", "கலித்தொகை "],
    correctAnswer: "அகநானூறு",
  },
  {
    question: "கி.மு. மூன்றாம் நூற்றாண்டு முதல் கி.பி. மூன்றாம் நூற்றாண்டு வரையிலான காலம் பொதுவாக எவ்வாறு அழைக்கப்படுகிறது?",
    options: ["பக்தி காலம்", "சங்க காலம்", "பல்லவர் காலம்", "நாயக்கர் காலம்"],
    correctAnswer: "சங்க காலம்",
  },
  {
    question: "திருக்குறளை இயற்றியவர் யார்?",
    options: ["கம்பர்", "ஒளவையார்", "திருவள்ளுவர்", "இளங்கோவடிகள் "],
    correctAnswer: "திருவள்ளுவர்",
  },
  {
    question: "சிலப்பதிகாரம் மற்றும் மணிமேகலை இரண்டும் எவ்வாறு அழைக்கப்படுகின்றன?",
    options: ["ஐம்பெருங்காப்பியங்கள்", "ஐஞ்சிறுகாப்பியங்கள்", "இரட்டைக் காப்பியங்கள்", "பக்தி இலக்கியங்கள்"],
    correctAnswer: "இரட்டைக் காப்பியங்கள்",
  },
  {
    question: "சோழர்களின் புகழ்பெற்ற மன்னர்களில் ஒருவரான இராஜராஜ சோழனால் கட்டப்பட்ட பெரிய கோயில் எங்குள்ளது?",
    options: ["மதுரை", "காஞ்சிபுரம்", "சிதம்பரம்", "தஞ்சாவூர்"],
    correctAnswer: "தஞ்சாவூர்",
  },
  {
    question: "தமிழை ஆட்சி மொழியாகக் கொண்ட வெளிநாடுகள் எவை? (இந்தியா தவிர)",
    options: ["மலேசியா, சிங்கப்பூர்", "இலங்கை, மியான்மர்", "இலங்கை, சிங்கப்பூர்", "சிங்கப்பூர், இந்தோனேசியா"],
    correctAnswer: "இலங்கை, சிங்கப்பூர்",
  },
  {
    question: "பக்தி இலக்கிய காலத்தில் சைவ அடியார்களின் பாடல்கள் எவ்வாறு தொகுக்கப்பட்டுள்ளன?",
    options: ["நாலாயிர திவ்வியப் பிரபந்தம்", "தேவாரம் மற்றும் திருவாசகம்", "திருமுறைகள்", "பெரிய புராணம் சரியான"],
    correctAnswer: "தேவாரம் மற்றும் திருவாசகம்",
  },
  {
    question: "பாண்டிய மன்னர்களின் தலைநகராக இருந்த தொன்மையான நகரம் எது?",
    options: ["உறையூர்", "பூம்புகார்", "காஞ்சிபுரம்", "மதுரை"],
    correctAnswer: "மதுரை",
  },
  {
    question: "தமிழ்நாட்டில் முதன்முதலில் அச்சு இயந்திரம் நிறுவப்பட்ட இடம் எது?",
    options: ["சென்னை", "தரங்கம்பாடி", "நாகப்பட்டினம்", "தூத்துக்குடி "],
    correctAnswer: "தரங்கம்பாடி",
  },
];

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [quizFinished, setQuizFinished] = useState(false);

  const handleAnswer = (selectedAnswer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctAnswer) {
        score++;
      }
    }
    return score;
  };

  if (quizFinished) {
    return (
      <>
      <Header />
     
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">வினாடி வினா முடிவுகள் </h2>
        <p className="mb-4">
          உங்கள் மதிப்பெண்: {calculateScore()} / {questions.length}
        </p>
        <ul className="space-y-4">
          {questions.map((q, index) => (
            <li key={index} className="border p-4 rounded-md">
              <p className="font-bold mb-2">{q.question}</p>
              <p>உங்கள் பதில்: {answers[index]}</p>
              <p className={`font-semibold ${answers[index] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                சரியான பதில்: {q.correctAnswer}
              </p>
            </li>
          ))}
        </ul>
        <Link to="/vilayattu" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md mt-10 inline-block">விலையாட்டுக்குத் திரும்பு</Link>
        
       
      </div>
      
        

       
      </div>
     
      </>
    
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (<>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Question {currentQuestionIndex + 1} / {questions.length}</h2>
          <p className="mb-4">{currentQuestion.question}</p>
          <ul className="space-y-2">
            {currentQuestion.options.map((option, index) => (
             <li key={index}>
             <button
               className={`text-left p-2 border rounded-md ${
                 answers[currentQuestionIndex] === option ? 'bg-green-300' : ''
               }`}
               onClick={() => handleAnswer(option)}
             >
               {option}
             </button>
           </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 mt-4" onClick={handleNext}>
          <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-green-500 stroke-2 fill-none"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>{currentQuestionIndex === questions.length - 1 ? 'Finish' : 'அடுத்தது'}
          </div>
        </div>
      </div>
     </>
  );
};

export default Quiz;