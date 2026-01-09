import React from 'react';

/**
 * Componente de gráfico de barras simples
 * Exibe barras verticais com animação hover
 */
const SimpleBarChart: React.FC = () => {
    const data = [40, 65, 45, 80, 55, 90, 75];

    return (
        <div className="flex items-end gap-1 h-12 mt-4 opacity-80">
            {data.map((h, i) => (
                <div key={i} className="flex-1 bg-red-900/30 rounded-sm relative group">
                    <div
                        className="absolute bottom-0 w-full bg-red-600 rounded-sm transition-all duration-500 group-hover:bg-red-500"
                        style={{ height: `${h}%` }}
                    ></div>
                </div>
            ))}
        </div>
    );
};

export default SimpleBarChart;
