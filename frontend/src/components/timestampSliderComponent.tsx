import React, { useState } from "react";

const DoubleEndedSlider = () => {
  const [startValue, setStartValue] = useState(0);
  const [endValue, setEndValue] = useState(100);

  const handleStartChange = (event) => {
    setStartValue(parseInt(event.target.value));
  };

  const handleEndChange = (event) => {
    setEndValue(parseInt(event.target.value));
  };

  return (
    <div class="range_container">
        <div class="sliders_control">
            <input id="fromSlider" type="range" value="10" min="0" max="100"/>
            <input id="toSlider" type="range" value="40" min="0" max="100"/>
        </div>
        <div class="form_control">
            <div class="form_control_container">
                <div class="form_control_container__time">Min</div>
                <input class="form_control_container__time__input" type="number" id="fromInput" value="10" min="0" max="100"/>
            </div>
            <div class="form_control_container">
                <div class="form_control_container__time">Max</div>
                <input class="form_control_container__time__input" type="number" id="toInput" value="40" min="0" max="100"/>
            </div>
        </div>
    </div>
);
};

export default DoubleEndedSlider;

