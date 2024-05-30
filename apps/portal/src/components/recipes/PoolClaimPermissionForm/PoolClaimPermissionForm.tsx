import { TalismanHandLoader } from '../../legacy/TalismanHandLoader'
import { useTheme } from '@emotion/react'
import {
  AlertDialog,
  Button,
  DescriptionList,
  HiddenDetails,
  Hr,
  RadioButton,
  Switch,
  Text,
  Tooltip,
} from '@talismn/ui'
import { Calculate, Info } from '@talismn/web-icons'
import { Suspense, createContext, useContext, type PropsWithChildren } from 'react'

const Context = createContext({ isSkeleton: false, onRequestDismiss: undefined as (() => unknown) | undefined })

type PermissionOptionProps = {
  checked?: boolean
  name: string
  description: string
  onCheck: () => unknown
}

const PermissionOption = (props: PermissionOptionProps) => {
  const theme = useTheme()
  return (
    <div
      onClick={props.onCheck}
      css={[
        {
          flex: 1,
          border: `1.4px solid ${theme.color.onBackground}`,
          borderRadius: '1.2rem',
          padding: '1.6rem',
          cursor: 'pointer',
        },
        !props.checked && {
          opacity: theme.contentAlpha.disabled / 2,
          ':hover': { opacity: theme.contentAlpha.medium },
        },
      ]}
    >
      <header css={{ marginBottom: '1.6rem' }}>
        <Text.BodyLarge alpha="high" as="div" css={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>{props.name}</div>
          <RadioButton checked={props.checked === true} />
        </Text.BodyLarge>
      </header>
      <Text.BodySmall as="div">{props.description}</Text.BodySmall>
    </div>
  )
}

export type PoolClaimPermission = 'compound' | 'withdraw' | 'all' | undefined

type PoolClaimPermissionFormProps = {
  permission: PoolClaimPermission
  onChangePermission: (permission: PoolClaimPermission) => unknown
  onSubmit: () => unknown
  submitPending?: boolean
  onRequestDismiss?: () => unknown
  isTalismanPool: boolean
  loading?: boolean
}

const PoolClaimPermissionForm = (props: PoolClaimPermissionFormProps) => {
  const context = useContext(Context)
  const onRequestDismiss = props.onRequestDismiss ?? context.onRequestDismiss

  return (
    <div>
      <div css={{ marginBottom: '1.6rem' }}>
        <label>
          <Switch
            checked={props.permission !== undefined}
            onChange={event => props.onChangePermission(event.target.checked ? 'compound' : undefined)}
          />{' '}
          {props.isTalismanPool ? 'Enable auto claiming' : 'Enable permissionless claiming'}
        </label>{' '}
        <Tooltip
          content={
            <>
              Allow others to re-stake on your behalf, powering your stake with auto-compounding.
              <br />
              Permissionless claiming is only guaranteed for members of Talisman pools that opt-in.
            </>
          }
        >
          <Info size="1em" css={{ verticalAlign: 'middle' }} />
        </Tooltip>
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.6rem',
          borderRadius: '1.6rem',
          padding: '1.6rem 0',
          '@media(min-width: 768px)': {
            flexDirection: 'row',
          },
        }}
      >
        <PermissionOption
          name={props.isTalismanPool ? 'Auto compound' : 'Allow compound'}
          description={
            props.isTalismanPool
              ? 'Your rewards will be re-staked for you daily'
              : 'Allow anyone to compound rewards on your behalf'
          }
          checked={props.permission === 'compound'}
          onCheck={() => props.onChangePermission('compound')}
        />
        <PermissionOption
          name={props.isTalismanPool ? 'Auto withdraw' : 'Allow withdraw'}
          description={
            props.isTalismanPool
              ? 'Your rewards will be paid to your account daily'
              : 'Allow anyone to withdraw rewards on your behalf'
          }
          checked={props.permission === 'withdraw'}
          onCheck={() => props.onChangePermission('withdraw')}
        />
        <PermissionOption
          name={props.isTalismanPool ? 'Let Talisman decide' : 'Allow all'}
          description={
            props.isTalismanPool
              ? 'Right now this is the same as the "Auto compound" option'
              : 'Allow anyone to withdraw rewards on your behalf'
          }
          checked={props.permission === 'all'}
          onCheck={() => props.onChangePermission('all')}
        />
      </div>
      {props.isTalismanPool && (
        <>
          <Hr />
          <DescriptionList emphasis="details">
            <DescriptionList.Description>
              <DescriptionList.Term>Claim threshold 1</DescriptionList.Term>
              <DescriptionList.Details>
                Daily when claim {'>'} {(5).toLocaleString(undefined, { style: 'currency', currency: 'usd' })}
              </DescriptionList.Details>
            </DescriptionList.Description>
            <DescriptionList.Description>
              <DescriptionList.Term>Claim threshold 2</DescriptionList.Term>
              <DescriptionList.Details>
                Weekly when claim {'>'} {(1).toLocaleString(undefined, { style: 'currency', currency: 'usd' })}
              </DescriptionList.Details>
            </DescriptionList.Description>
          </DescriptionList>
        </>
      )}
      <div css={{ display: 'flex', gap: '1.6rem', marginTop: '4.6rem', '> *': { flex: 1 } }}>
        {onRequestDismiss && (
          <Button disabled={context.isSkeleton} variant="outlined" onClick={onRequestDismiss}>
            Cancel
          </Button>
        )}
        <Button disabled={context.isSkeleton} loading={props.submitPending} onClick={props.onSubmit}>
          Submit
        </Button>
      </div>
    </div>
  )
}

type PoolClaimPermissionDialogProps = PropsWithChildren<{
  onRequestDismiss: () => unknown
}>

export const PoolClaimPermissionDialog = (props: PoolClaimPermissionDialogProps) => (
  <AlertDialog
    title={
      <>
        <Calculate css={{ verticalAlign: 'bottom' }} /> Claim method
      </>
    }
    targetWidth="77rem"
    {...props}
  >
    <Suspense
      fallback={
        <Context.Provider value={{ isSkeleton: true, onRequestDismiss: props.onRequestDismiss }}>
          <HiddenDetails hidden overlay={<TalismanHandLoader />}>
            <PoolClaimPermissionForm
              permission={undefined}
              onChangePermission={() => {}}
              onSubmit={() => {}}
              onRequestDismiss={props.onRequestDismiss}
              isTalismanPool={false}
            />
          </HiddenDetails>
        </Context.Provider>
      }
    >
      <Context.Provider value={{ isSkeleton: false, onRequestDismiss: props.onRequestDismiss }}>
        {props.children}
      </Context.Provider>
    </Suspense>
  </AlertDialog>
)

export default PoolClaimPermissionForm
