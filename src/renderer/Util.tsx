import { forwardRef, Textarea } from '@chakra-ui/react';
import ResizeTextarea from 'react-textarea-autosize';

export const ResizingTextarea = forwardRef((props, ref) => {
  return (
    <Textarea
      minH="unset"
      overflow="hidden"
      w="100%"
      resize="none"
      ref={ref}
      minRows={3}
      as={ResizeTextarea}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
});
