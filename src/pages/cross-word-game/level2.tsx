import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";

interface Word {
  name: string;
  positions: number[];
  found: boolean;
}

const words: Word[] = [
  { name: "காவிரி", positions: [0, 8, 16], found: false },
  { name: "பள்ளி", positions: [33, 34, 35], found: false },
  { name: "மலர்", positions: [1, 9, 17], found: false },
  { name: "குறள்", positions: [10, 11, 12], found: false },
];

const gridData = [
  "கா", "ம", "ர", "க", "த", "ம்", "ப", "ச",
  "வி", "ல", "கு", "ற", "ள்", "வி", "ள்", "ல",
  "ரி", "ர்", "கு", "ய", "ம்", "கா", "ளி", "க",
  "த", "அ", "நி", "ச", "இ", "ரா", "வி", "ல்",
  "மி", "ப", "ள்", "ளி", "ந", "க", "பு", "ரி",
  "ல", "ன்", "உ", "மா", "ரி", "ச", "பா", "எ",
  "ர்", "அ", "க", "ற", "த", "ம்", "ச", "மு",
  "ற", "வி", "ஞ்", "ஞ", "ன்", "ஊ", "ர்", "த்",
];

const Level2: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [wordList, setWordList] = useState<Word[]>(words);

  const handleCellClick = (index: number) => {
    if (gridData[index] == null) return;
    const isFound = wordList.some(
      (word) => word.found && word.positions.includes(index)
    );

    if (!isFound) {
      setSelectedCells((prevSelected) => {
        const isSelected = prevSelected.includes(index);
        if (isSelected) {
          return prevSelected.filter((i) => i !== index);
        } else {
          return [...prevSelected, index];
        }
      });
    }
  };

  const handleReset = () => {
    setSelectedCells([]);
    setMessage("");
  };

  const markWordAsFound = (word: Word) => {
    setWordList((prevWords) =>
      prevWords.map((w) =>
        w.name === word.name ? { ...w, found: true } : w
      )
    );
    setSelectedCells([]);
    setMessage(`"${word.name}" கண்டுபிடிக்கப்பட்டது!`);
  };

  const handleCheck = () => {
    if (selectedCells.length === 0) {
      setMessage("சொற்களைத் தேர்ந்தெடுக்கவும்");
      return;
    }
    const sortedSelectedCells = [...selectedCells].sort((a, b) => a - b);
    for (const word of wordList) {
      if (word.found) continue;
      const sameLength = sortedSelectedCells.length === word.positions.length;
      const containsAllPositions = word.positions.every((pos) =>
        sortedSelectedCells.includes(pos)
      );
      const selectedContainsAllPositions = sortedSelectedCells.every((pos) =>
        word.positions.includes(pos)
      );
      if (sameLength && containsAllPositions && selectedContainsAllPositions) {
        markWordAsFound(word);
        return;
      }
    }
    setMessage("சரியான சொல் இல்லை. மீண்டும் முயற்சிக்கவும்.");
  };
  
  const handleHint = () => {
    const unfoundWord = wordList.find((word) => !word.found);
    if (unfoundWord) {
      setSelectedCells([unfoundWord.positions[0]]);
      setMessage(`"${unfoundWord.name}" என்ற சொல்லைக் கண்டுபிடிக்கவும்`);
    } else {
      setMessage("அனைத்து சொற்களும் கண்டுபிடிக்கப்பட்டன!");
    }
  };
  
  const handleWordItemClick = (wordName: string) => {
    const word = wordList.find((w) => w.name === wordName);
    if (word && !word.found) {
      setSelectedCells([word.positions[0]]);
      setMessage(`"${wordName}" என்ற சொல்லைக் கண்டுபிடிக்கவும்`);
    }
  };
  
  useEffect(() => {
    if (wordList.every((w) => w.found)) {
      setMessage("வாழ்த்துக்கள்! அனைத்து சொற்களும் கண்டுபிடிக்கப்பட்டன!");
    }
  }, [wordList]);
  
  return (
    <div className="min-h-screen bg-white text-gray-800 flex">
      <Sidebar isOpen={false} onCategoryChange={undefined}/>
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={function (): void {
          throw new Error("Function not implemented.");
        }}/>
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <button className="w-12 h-12 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center rounded-full hover:bg-green-50 transition-colors duration-200" onClick={() => navigate('/vilayattu')}>
              <svg viewBox="0 0 24 24" className="w-6 h-6 stroke-green-500 stroke-2 fill-none">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="text-xl font-semibold text-green-500">நிலை 2</div> 
          </div>
           <div className="bg-green-500 text-white p-6 rounded-xl mb-8 text-center shadow-md">
            <div className="text-xl font-semibold tracking-wide">கண்டுபிடிக்க வேண்டிய சொற்கள்</div>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {wordList.map((word) => (
                <div
                  key={word.name}
                  className={`px-4 py-2 rounded-md transition-all duration-300 cursor-pointer ${word.found ? "bg-sky-400 line-through" : "bg-opacity-20 bg-white"}`}
                  onClick={() => handleWordItemClick(word.name)}
                >
                  {word.name}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-8 rounded-3xl shadow">
            <div className="grid grid-cols-8 gap-1 bg-transparent max-w-[500px] mx-auto">
              {gridData.map((cell, index) => {
                const isSelected = selectedCells.includes(index);
                const isFound = wordList.some((word) => word.found && word.positions.includes(index));
                
                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-2xl font-medium select-none cursor-pointer transition-all duration-200 rounded-xl ${
                      isSelected 
                        ? "bg-green-400 text-black border border-green-500" 
                        : isFound 
                          ? "bg-green-400 text-black border border-green-500" 
                          : "bg-white border border-gray-300 hover:bg-green-50"
                    }`}
                    onClick={() => handleCellClick(index)}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>

            <div className="message text-center mt-4 font-medium min-h-[2rem] text-green-800">{message}</div>
            <div className="flex justify-center mt-6 gap-4">
              <button className="bg-green-500 text-white border-none px-6 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200 hover:bg-green-700" onClick={handleReset}>மீட்டமை</button>
              <button className="bg-green-500 text-white border-none px-6 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200 hover:bg-green-700" onClick={handleCheck}>சரிபார்</button>
              <button className="bg-green-500 text-white border-none px-6 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200 hover:bg-green-700" onClick={handleHint}>குறிப்பு</button>
            </div>
            {wordList.every((w) => w.found) && (
              <div className="flex justify-end mt-4">
                <button
                  className="bg-green-500 text-white border-none px-6 py-3 rounded-md font-medium cursor-pointer transition-colors duration-200 hover:bg-green-700"
                  onClick={() => navigate("/vilayattu")}
                >
                  அடுத்தது
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Level2;