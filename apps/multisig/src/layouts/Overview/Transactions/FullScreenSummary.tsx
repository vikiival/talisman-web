import MemberRow from '@components/MemberRow'
import StatusCircle, { StatusCircleType } from '@components/StatusCircle'
import { tokenPriceState } from '@domains/chains'
import { Balance, Transaction, TransactionType, usePendingTransactions } from '@domains/multisig'
import { css } from '@emotion/css'
import { Button, CircularProgressIndicator, Skeleton } from '@talismn/ui'
import { balanceToFloat, formatUsd } from '@util/numbers'
import { useMemo, useState } from 'react'
import { useRecoilValueLoadable } from 'recoil'

import TransactionDetailsExpandable from './TransactionDetailsExpandable'
import TransactionSummaryRow from './TransactionSummaryRow'

enum PillType {
  Pending,
  Approved,
}

const Pill = ({ children, type }: { children: React.ReactNode; type: PillType }) => {
  return (
    <div
      className={css`
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 4px 8px;
        height: 25px;
        background: ${type === PillType.Pending ? 'rgba(244, 143, 69, 0.25)' : 'rgba(56, 212, 72, 0.25)'};
        color: ${type === PillType.Pending ? 'rgba(244, 143, 69, 1)' : 'rgba(56, 212, 72, 1)'};
        border-radius: 12px;
      `}
    >
      {children}
    </div>
  )
}

const Approvals = ({ t }: { t: Transaction }) => {
  return (
    <div css={{ display: 'grid', gap: '14px' }}>
      {Object.entries(t.approvals).map(([address, approval]) => (
        <div key={address} css={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
          <div css={{ width: '100%' }}>
            <MemberRow member={{ address }} chain={t.chain} />
          </div>
          <div
            className={css`
              grid-area: executedInfo;
              margin-left: 24px;
            `}
          >
            <StatusCircle
              type={approval ? StatusCircleType.Success : StatusCircleType.Unknown}
              circleDiameter="24px"
              iconDimentions={{ width: '11px', height: 'auto' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export const FullScreenDialogTitle = ({ t }: { t?: Transaction }) => {
  if (!t) return null

  const pillType =
    Object.values(t.approvals).filter(Boolean).length === Object.values(t.approvals).length
      ? PillType.Approved
      : PillType.Pending
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        gap: 12px;

        > h2 {
          font-weight: bold;
          color: var(--color-foreground);
        }
      `}
    >
      <h2>Transaction Summary</h2>
      <Pill type={pillType}>
        <p css={{ fontSize: '12px', marginTop: '3px' }}>{pillType === PillType.Approved ? 'Approved' : 'Pending'}</p>
      </Pill>
    </div>
  )
}

export const FullScreenDialogContents = ({
  t,
  cancelButtonTextOverride,
  canCancel,
  readyToExecute,
  fee,
  onCancel,
  onApprove,
}: {
  t?: Transaction
  cancelButtonTextOverride?: string
  readyToExecute?: boolean
  canCancel: boolean
  fee: Balance | undefined
  onCancel: () => Promise<void>
  onApprove: () => Promise<void>
}) => {
  const [cancelInFlight, setCancelInFlight] = useState(false)
  const [approveInFlight, setApproveInFlight] = useState(false)
  const feeTokenPrice = useRecoilValueLoadable(tokenPriceState(fee?.token?.coingeckoId || ''))
  const { transactions: pendingTransactions, loading: pendingLoading } = usePendingTransactions()
  const feeComponent = useMemo(() => {
    if (feeTokenPrice.state === 'loading' || !fee) {
      return <Skeleton.Surface css={{ width: '150px', height: '16px' }} />
    }
    return (
      <p>{`${balanceToFloat(fee)} ${fee?.token.symbol} (${formatUsd(
        balanceToFloat(fee) * feeTokenPrice.contents
      )})`}</p>
    )
  }, [feeTokenPrice, fee])

  if (!t) return null

  // TODO: this should check if any of the users connected wallets have not approved. if
  // multiple, show selector for user to decide which wallet to sign with
  const userCanApprove = Object.values(t.approvals).filter(Boolean).length < Object.values(t.approvals).length

  return (
    <div
      className={css`
        display: grid;
        align-items: start;
        height: calc(100% - 40px * 3);
      `}
    >
      <div
        className={css`
          display: grid;
          align-content: start;
          gap: 32px;
          padding: 0 42px 24px 42px;
          height: 100%;
          overflow-x: visible;
          overflow-y: auto;
        `}
      >
        <TransactionSummaryRow t={t} shortDate={false} />
        <div css={{ display: 'grid', gap: '32px', alignItems: 'start' }}>
          <div css={{ display: 'grid', gap: '13px' }}>
            <h3>Details</h3>
            <TransactionDetailsExpandable t={t} />
          </div>
          <div css={{ display: 'grid', gap: '13px' }}>
            <h3>Approvals</h3>
            <Approvals t={t} />
          </div>
        </div>
      </div>
      {userCanApprove && (
        <div
          className={css`
            display: grid;
            margin-top: auto;
            border-top: 1px solid var(--color-backgroundLighter);
            gap: 16px;
            padding: 32px;
          `}
        >
          <div css={{ display: 'flex', justifyContent: 'space-between' }}>
            {readyToExecute && !t.callData ? (
              'Cannot execute transaction without calldata'
            ) : t.decoded?.type === TransactionType.ChangeConfig && pendingTransactions.length > 1 ? (
              `You must execute or cancel all pending transactions (${
                pendingTransactions.length - 1
              } remaining) before changing the signer configuration`
            ) : (
              <>
                <p>Fees</p>
                {feeComponent}
              </>
            )}
          </div>
          <div css={{ display: 'grid', height: '56px', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setCancelInFlight(true)
                onCancel().finally(() => {
                  setCancelInFlight(false)
                })
              }}
              disabled={approveInFlight || cancelInFlight || !canCancel}
            >
              {cancelInFlight ? (
                <CircularProgressIndicator />
              ) : !canCancel ? (
                'Only originator can cancel'
              ) : (
                cancelButtonTextOverride || 'Reject'
              )}
            </Button>
            <Button
              onClick={() => {
                setApproveInFlight(true)
                onApprove().finally(() => {
                  setApproveInFlight(false)
                })
              }}
              disabled={
                pendingLoading ||
                approveInFlight ||
                cancelInFlight ||
                !fee ||
                (readyToExecute && !t.callData) ||
                (t.decoded?.type === TransactionType.ChangeConfig && pendingTransactions.length > 1)
              }
            >
              {approveInFlight ? <CircularProgressIndicator /> : readyToExecute ? 'Approve & Execute' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}