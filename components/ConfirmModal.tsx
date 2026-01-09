import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDangerous = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center ${isDangerous ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-colors ${isDangerous
                                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
