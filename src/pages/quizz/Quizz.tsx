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
    question: "தஞ்சாவூரில் உள்ள பிரஹதீஸ்வரர் (பெருவுடையார்) கோவிலை 1010 CE-ல் கட்டியவர் யார்?",
    options: ["ராஜேந்திர சோழன் I", "ராஜராஜ சோழன் I", "குலோதுங்க சோழன் I", "ராஜராஜ சோழன் II"],
    correctAnswer: "ராஜராஜ சோழன் I",
  },
  {
    question: "சிலப்பதிகாரம் என்ற தமிழ் மாபெரும் வாழ்த்து காவியம் எழுதியவர் யார்?",
    options: ["அவ்வையார்", "அத்துவையார்", "கம்பன்", "இளங்கோ அடிகள்"],
    correctAnswer: "இளங்கோ அடிகள்",
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
          <h2 className="text-3xl font-bold text-green-700 mb-6">வினாடி வினா முடிவுகள் </h2>
          <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
            <p className="text-lg text-gray-700">
              உங்கள் மதிப்பெண்: <span className="font-bold text-green-600">{calculateScore()}</span> / {questions.length}
            </p>
          </div>
          <ul className="space-y-6">
            {questions.map((q, index) => (
              <li key={index} className="border border-gray-300 p-5 rounded-lg bg-white shadow-sm">
                <p className="font-bold mb-3 text-gray-800">{q.question}</p>
                <p className="text-gray-600">உங்கள் பதில்: {answers[index]}</p>
                <p className={`font-semibold ${answers[index] === q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                  சரியான பதில்: {q.correctAnswer}
                </p>
              </li>
            ))}
          </ul>
          <Link to="/vilayattu" className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg mt-10 inline-block font-medium">விலையாட்டுக்குத் திரும்பு</Link>
        
       
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
          <h2 className="text-3xl font-bold text-green-700 mb-6">Question {currentQuestionIndex + 1} / {questions.length}</h2>
          <p className="text-lg text-gray-800 mb-6">{currentQuestion.question}</p>
          <ul className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <li key={index}>
                <button
                  className={`w-full text-left px-4 py-3 border rounded-lg ${
                    answers[currentQuestionIndex] === option
                      ? 'bg-green-300 border-green-500 font-semibold text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                  } transition duration-300`}
                  onClick={() => handleAnswer(option)}
                >
                  <span className="block text-base font-medium">
                  {option}

                  </span>
                </button>
           </li>
            ))}
          </ul>
          <button onClick={handleNext} className="mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg inline-flex items-center justify-center">
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'அடுத்தது'}
          </button>
        </div>
      </div>
     </>
  );
};

export default Quiz;
