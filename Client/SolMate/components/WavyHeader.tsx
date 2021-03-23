import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

const WavyHeader = ({
    customStyles,
    customHeight,
    customTop,
    customBgColor,
    customWavePattern
}) => {
    return (
        <View style={customStyles}>
            <View style={{ backgroundColor: customBgColor, height: customHeight }}>
                <Svg
                    // height="60%"
                    // width="150%"
                    viewBox="0 0 1440 320"
                    style={{ position: 'relative', top: customTop }}
                >
                    <Path fill={customBgColor} d={customWavePattern} />
                </Svg>
            </View>
        </View>
    );
};

export default WavyHeader;