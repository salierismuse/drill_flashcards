import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

// Helper to center the crop initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropper({ imageSrc, onConfirm, onCancel }) {
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const modalRef = useRef(null);

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Set initial completed crop to full image or center
        setCompletedCrop(newCrop);
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If we have a crop, confirm. IF NOT (initial state), confirm original? 
            // Actually, handle "Enter" to skip/confirm current selection
            if (completedCrop) {
                confirmCrop();
            } else {
                onConfirm(imageSrc); // No crop, use original
            }
        } else if (e.key === 'Escape') {
            onCancel(); // Cancel everything
        }
    };

    useEffect(() => {
        // Focus modal for keyboard events
        modalRef.current?.focus();
    }, []);

    const confirmCrop = () => {
        if (!completedCrop || !imgRef.current) {
            onConfirm(imageSrc);
            return;
        }

        const image = imgRef.current;
        const openCrop = completedCrop;

        // Sanity check
        if (openCrop.width === 0 || openCrop.height === 0) {
            onConfirm(imageSrc);
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = openCrop.width * scaleX;
        canvas.height = openCrop.height * scaleY;

        const ctx = canvas.getContext('2d');

        // Draw selection
        ctx.drawImage(
            image,
            openCrop.x * scaleX,
            openCrop.y * scaleY,
            openCrop.width * scaleX,
            openCrop.height * scaleY,
            0,
            0,
            openCrop.width * scaleX,
            openCrop.height * scaleY,
        );

        const base64 = canvas.toDataURL('image/png');
        onConfirm(base64);
    };

    return (
        <div className="modal-overlay cropper-overlay" onKeyDown={handleKeyDown} tabIndex={-1} ref={modalRef}>
            <div className="modal cropper-modal" onClick={e => e.stopPropagation()}>
                <div className="cropper-header">
                    <h2>Crop Image</h2>
                    <div className="cropper-hints">
                        <span>Enter to confirm</span>
                        <span>Esc to cancel</span>
                    </div>
                </div>

                <div className="cropper-container">
                    <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                        <img ref={imgRef} src={imageSrc} onLoad={onImageLoad} alt="Crop me" />
                    </ReactCrop>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => onConfirm(imageSrc)}>
                        Skip (Use Original)
                    </button>
                    <button className="btn btn-primary" onClick={confirmCrop}>
                        Confirm Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
