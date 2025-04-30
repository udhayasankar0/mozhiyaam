import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Vilayattu = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">விளையாட்டு</h1>

        {/* search bar for games
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search by title, username..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        */}

        <div className="flex space-x-4 mb-4">
          <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-[40px]">
            தமிழ் வினாடி வினா
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-[40px]">
            சொல் தேடல்
          </Button>

          <Button
            disabled
            className="bg-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-[40px]"
          >
            தமிழ் எழுத்துக்கள்
          </Button>
          <Button
            disabled
            className="bg-gray-200 text-gray-500 font-semibold px-4 py-2 rounded-[40px]"
          >
            தமிழ் மரபு சுற்றுலா
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Game 1 */}
          <Card className="shadow-md rounded-lg">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800">
                சொல் தேடல்
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-700 mb-4">
                பழமொழிகள், இலக்கியச் சொற்கள், அரிய தமிழ் சொற்களை கண்டுபிடிக்கும் விளையாட்டு
              </p>
              <Link to="/cross-word-game/level1">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-[40px]">
                  விளையாடு
                </Button>
              </Link>
              
            </CardContent>
          </Card>
          

          {/* Game 2 */}
          <Card className="shadow-md rounded-lg">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800">
                தமிழ் வினாடி வினா
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-700 mb-4">
                தமிழ் மொழி, இலக்கியம், வரலாறு பற்றிய அறிவை சோதித்து பாருங்கள்
              </p>
              <Link to="/quizz/Quizz">
                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-[40px]">
                  விளையாடு
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">

        
          {/* Game 3 */}
          <Card className="shadow-md rounded-lg bg-gray-100">
            <CardHeader className="p-4">
              <CardTitle className="text-xl font-semibold text-gray-800">
                தமிழ் எழுத்துக்கள்
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-gray-500 mb-4">விரைவில்</p>
            </CardContent>
          </Card>          
        </div>
      </div>
    </MainLayout>
  );
};

export default Vilayattu;