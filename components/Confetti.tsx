import React from 'react';

// Este componente funcional renderiza uma única peça de confete.
// O estilo é passado como um prop para permitir a randomização de cor, posição e animação.
const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
    // A classe base fornece a forma e o nome da animação.
    return <div className="confetti-piece" style={style}></div>;
};

// Este componente gera e renderiza uma chuva de confetes.
const Confetti: React.FC = () => {
    // Número de peças de confete a serem renderizadas.
    const confettiCount = 150;

    // Cria um array de peças de confete.
    const pieces = Array.from({ length: confettiCount }).map((_, index) => {
        // Gera propriedades aleatórias para cada peça para criar uma aparência variada e natural.
        const style: React.CSSProperties = {
            // Posição inicial horizontal aleatória.
            left: `${Math.random() * 100}%`,
            // Atraso de animação aleatório para que não comecem todos ao mesmo tempo.
            animationDelay: `${Math.random() * 4}s`,
            // Duração de animação aleatória para velocidades de queda variadas.
            animationDuration: `${2 + Math.random() * 3}s`,
            // Cor vibrante aleatória usando HSL para uma paleta de cores agradável.
            backgroundColor: `hsl(${Math.random() * 360}, 90%, 60%)`,
            // Rotação inicial aleatória.
            transform: `rotate(${Math.random() * 360}deg)`,
            // Varia a opacidade para um pouco de profundidade.
            opacity: Math.random() * 0.5 + 0.5,
        };
        return <ConfettiPiece key={index} style={style} />;
    });

    // O contêiner segura todas as peças.
    return <div className="confetti-container">{pieces}</div>;
};

export default Confetti;