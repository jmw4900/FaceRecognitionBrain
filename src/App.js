import React, { useState } from "react";
import Navigation from "./components/Navigation/Navigation";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import "./App.css";

const app = new Clarifai.App({
  apiKey: "e8d5815d710e422db996366366249fa4"
});

const particlasOptions = {
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        value_area: 300
      }
    }
  }
};

function App() {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [boxes, setBoxes] = useState([]);
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const calculateFaceLocation = data => {
    const faceRegions = data.outputs[0].data.regions;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);

    const clarifaiFaces = faceRegions.map(face => {
      return {
        leftCol: face.region_info.bounding_box.left_col * width,
        topRow: face.region_info.bounding_box.top_row * height,
        rightCol: width - face.region_info.bounding_box.right_col * width,
        bottomRow: height - face.region_info.bounding_box.bottom_row * height
      };
    });

    return clarifaiFaces;
  };

  const displayFaceBox = boxes => {
    setBoxes(boxes);
  };

  const onInputChange = event => {
    setInput(event.target.value);
  };

  const onButtonSubmit = () => {
    setImageUrl(input);
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, input)
      .then(response => displayFaceBox(calculateFaceLocation(response)))
      .catch(error => console.log(error));
  };

  const onRouteChange = route => {
    if (route === "signout") {
      setIsSignedIn(false);
    } else if (route === "home") {
      setIsSignedIn(true);
    }
    setRoute(route);
  };

  return (
    <div className="App">
      <Particles className="particles" params={particlasOptions} />
      <Navigation onRouteChange={onRouteChange} isSignedIn={isSignedIn} />
      {route === "home" ? (
        <>
          <Logo />
          <Rank />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition boxes={boxes} imageUrl={imageUrl} />
        </>
      ) : route === "signin" ? (
        <Signin onRouteChange={onRouteChange} />
      ) : (
        <Register onRouteChange={onRouteChange} />
      )}
    </div>
  );
}

export default App;
