/** @format */

import Button from '@/_components/forms/Button';
import Card from '@/_components/Card';
import Grid from '@/_components/layout/Grid';
import Text from '@/_components/typography/Text';

type EntityUnavailableProps = Readonly<{
  title: string;
  message: string;
  backHref?: string;
  backLabel?: string;
}>;

export default function EntityUnavailable({
  title,
  message,
  backHref,
  backLabel = 'Back',
}: EntityUnavailableProps): React.JSX.Element {
  return (
    <Card>
      <Grid gap={16}>
        <Text weight='bold'>{title}</Text>
        <Text size='small' color='gray'>
          {message}
        </Text>
        {backHref ? (
          <div>
            <Button href={backHref} variant='borderless'>
              {backLabel}
            </Button>
          </div>
        ) : null}
      </Grid>
    </Card>
  );
}
