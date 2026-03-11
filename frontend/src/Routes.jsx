import { Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage";
import GamePage from "./GamePage";
import MonkeyType from "./games/MonkeyType/App";
import WordleClone from "./games/Wordle";
import Pacman from "./games/Pacman/App";
import MemeDecoder from "./games/MemeDecoder/App";
import Emoji from "./games/Emoji/Emoji";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/monkeytype" element={<GamePage title="MonkeyType"><MonkeyType /></GamePage>} />
      <Route path="/wordle" element={<GamePage title="Wordle"><WordleClone /></GamePage>} />
      <Route path="/pacman" element={<GamePage title="Pacman"><Pacman /></GamePage>} />
      <Route path="/meme-decoder" element={<GamePage title="Meme Decoder"><MemeDecoder /></GamePage>} />
      <Route path="/emoji" element={<GamePage title="Emoji Game"><Emoji /></GamePage>} />
    </Routes>
  );
}

export default App;
