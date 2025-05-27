import { useState, useEffect } from 'react';
import './App.css'; 
import './index.css'; 

const DrawingChallengeApp = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedTime, setSelectedTime] = useState(300);
  const [timerActive, setTimerActive] = useState(false);

  const UNSPLASH_ACCESS_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

  const categories = {
    animals: { emoji: '🐱', name: '動物', keywords: ['cat', 'dog', 'bird', 'lion', 'elephant'] },
    nature: { emoji: '🌲', name: '自然・風景', keywords: ['tree', 'mountain', 'ocean', 'flower', 'sunset'] },
    food: { emoji: '🍎', name: '食べ物', keywords: ['apple', 'pizza', 'cake', 'coffee', 'bread'] },
    objects: { emoji: '🎯', name: '物・道具', keywords: ['book', 'camera', 'guitar', 'clock', 'lamp'] },
    people: { emoji: '👥', name: '人物', keywords: ['person', 'child', 'family', 'portrait', 'smile'] },
    scenes: { emoji: '🏞️', name: 'シーン', keywords: ['city', 'street', 'park', 'cafe', 'library'] }
  };

  const timeOptions = [
    { value: 60, label: '1分' },
    { value: 300, label: '5分' },
    { value: 600, label: '10分' },
    { value: 1800, label: '30分' },
    { value: 0, label: '制限なし' }
  ];

  // タイマー機能
  useEffect(() => {
    let interval = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0 && timerActive) {
      setTimerActive(false);
      alert('時間切れ！お疲れ様でした 🎨');
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (selectedTime > 0) {
      setTimer(selectedTime);
      setTimerActive(true);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimer(0);
  };

const fetchRandomImage = async () => {
  if (!selectedCategory) return;
  setLoading(true);
  stopTimer();

  // フォールバックを削除して、Unsplash APIのみ使用
  try {
    const categoryData = categories[selectedCategory];
    const randomKeyword = categoryData.keywords[Math.floor(Math.random() * categoryData.keywords.length)];
    
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = `https://api.unsplash.com/photos/random?query=${randomKeyword}&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    
    if (!response.ok) {
      // API失敗時は別のキーワードで再試行
      const anotherKeyword = categoryData.keywords[Math.floor(Math.random() * categoryData.keywords.length)];
      const retryUrl = `https://api.unsplash.com/photos/random?query=${anotherKeyword}&client_id=${UNSPLASH_ACCESS_KEY}`;
      const retryResponse = await fetch(proxyUrl + encodeURIComponent(retryUrl));
      const retryData = await retryResponse.json();
      
      setCurrentImage({
        url: retryData.urls.regular,
        alt: retryData.alt_description || `${anotherKeyword} image`,
        photographer: retryData.user.name,
        link: retryData.links.html
      });
    } else {
      const data = await response.json();
      setCurrentImage({
        url: data.urls.regular,
        alt: data.alt_description || `${randomKeyword} image`,
        photographer: data.user.name,
        link: data.links.html
      });
    }
    
    startTimer();
  } catch (error) {
    console.error('Error fetching image:', error);
    // 最終的なフォールバックとして、カテゴリ名で検索
    alert('画像の取得に失敗しました。もう一度お試しください。');
  } finally {
    setLoading(false);
  }
};

  const startChallenge = () => {
    setShowChallenge(true);
    fetchRandomImage();
  };

  const backToSelection = () => {
    setShowChallenge(false);
    setCurrentImage(null);
    stopTimer();
  };

  if (showChallenge) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
            🎨 ランダム描画チャレンジ
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <span className="ml-4 text-gray-600">画像を取得中...</span>
            </div>
          ) : currentImage ? (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-2xl">{categories[selectedCategory].emoji}</span>
              </div>
              
         <div className="flex justify-center mb-4">
  <img 
    src={currentImage.url} 
    alt={currentImage.alt}
    className="w-full max-w-2xl mx-auto max-h-[600px] rounded-lg shadow-md object-contain"
  />
</div>
              
              <p className="text-center text-gray-600 text-sm">
                Photo by {currentImage.photographer}
              </p>
            </div>
          ) : null}

          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex justify-center items-center gap-4 mb-4">
              {timeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
  setSelectedTime(option.value);
  if (option.value > 0) {
    setTimer(option.value);
    setTimerActive(true);
  } else {
    setTimer(0);
    setTimerActive(false);
  }
}}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTime === option.value
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                timer <= 30 && timerActive ? 'bg-red-100 text-red-800' : 'bg-gray-800 text-white'
              }`}>
                {selectedTime === 0 ? '--:--' : formatTime(timer)}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={fetchRandomImage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              新しいお題
            </button>
            <button
              onClick={backToSelection}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              カテゴリ選択に戻る
            </button>
          </div>

          <div className="mt-6 text-center text-gray-600 text-sm">
            アナログでも、デジタルでも、お好きな方法で描いてください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🎨 ランダム描画チャレンジ
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === key
                    ? 'border-gray-800 bg-gray-800 text-white'
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{category.emoji}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </button>
            ))}
          </div>

          <button
            onClick={startChallenge}
            disabled={!selectedCategory}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedCategory
                ? 'bg-gray-800 hover:bg-gray-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            チャレンジ開始！
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingChallengeApp;