import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import clsx from 'clsx';
import React from 'react';

interface StyledModalProps {
  title: string;
  children: React.ReactNode;
  open: boolean;
  size?: 'small' | 'medium' | 'large';
  onClose: () => void;
}
const StyledModal: React.FC<StyledModalProps> = (props) => {
  const { size = 'medium' } = props;
  return (
    <Dialog
      as='div'
      className='relative z-10 focus:outline-none'
      onClose={props.onClose}
      open={props.open}
    >
      <DialogBackdrop className='fixed inset-0 bg-black/30' />

      <div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
        <div
          className={clsx('flex min-h-full items-center justify-center p-4')}
        >
          <DialogPanel
            className={clsx('p-4 bg-white', {
              'max-w-md w-full': size === 'small',
              'max-w-lg w-full': size === 'medium',
              'max-w-3xl w-full': size === 'large',
            })}
          >
            <DialogTitle className='text-2xl font-bold text-center text-gray-800'>
              {props.title}
            </DialogTitle>
            <Description as='div'>{props.children}</Description>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default StyledModal;
