import React from 'react';

const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
    return <div className="star" style={style}></div>;
};

const ShootingStars: React.FC = () => {
    const starCount = 10;

    const stars = Array.from({ length: starCount }).map((_, index) => {
        const style: React.CSSProperties = {
            top: `${Math.random() * 80 - 20}%`, // Start from various vertical positions
            left: `${Math.random() * 80 - 20}%`, // Start from various horizontal positions
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${0.5 + Math.random() * 1}s`,
        };
        return <Star key={index} style={style} />;
    });

    return <div className="stars-container">{stars}</div>;
};

export default ShootingStars;