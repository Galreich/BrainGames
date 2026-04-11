import React from 'react';
import { useTranslation } from 'react-i18next';
import { Emojis } from '../utils/Emojis';

const SuggestionImageUpload = ({
  imageData,
  imageError,
  onImageChange,
  onRemoveImage,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <label className='suggestion-label'>{t('Image_Optional')}</label>
      <label className='suggestion-file-label'>
        <span className='suggestion-file-icon'>{Emojis.Frame}</span>
        <span>
          {imageData
            ? `${t('Image_Selected')} ${Emojis.CheckMark}`
            : t('Click_to_select_image')}
        </span>
        <input
          type='file'
          accept='image/*'
          onChange={onImageChange}
          style={{ display: 'none' }}
        />
      </label>
      {imageData && (
        <div className='suggestion-image-preview-container'>
          <img
            src={imageData}
            alt={t('Image_Preview')}
            className='suggestion-image-preview'
          />
          <button
            type='button'
            onClick={onRemoveImage}
            className='suggestion-image-remove-btn'
          >
            {Emojis.Cross}
          </button>
        </div>
      )}
      {imageError && <div className='suggestion-image-error'>{imageError}</div>}
    </div>
  );
};

export default SuggestionImageUpload;
