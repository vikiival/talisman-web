import { InjectedAccount } from '@domains/extension'
import { CircularProgressIndicator, Identicon } from '@talismn/ui'
import { useEffect, useMemo, useRef, useState } from 'react'
import truncateMiddle from 'truncate-middle'
import { ChevronVertical, Search } from '@talismn/icons'
import { useOnClickOutside } from '../domains/common/useOnClickOutside'
import { useSignIn } from '../domains/auth'
import { css } from '@emotion/css'
import { device } from '../util/breakpoints'

type Props = {
  accounts: InjectedAccount[]
  selectedAccount?: InjectedAccount
  onSelect?: (account: InjectedAccount) => void
}

const AccountRow = ({
  account,
  onSelect,
}: {
  account: InjectedAccount
  onSelect: (account: InjectedAccount) => void
}) => {
  const addressString = account.address.toSs58()
  return (
    <div
      onClick={() => onSelect?.(account)}
      css={({ color }) => ({
        'display': 'flex',
        'alignItems': 'center',
        'gap': 8,
        'padding': '8px 12px',
        'cursor': 'pointer',
        'width': '100%',
        'backgroundColor': color.surface,
        ':hover': {
          filter: 'brightness(1.2)',
          div: { p: { color: color.offWhite } },
        },
      })}
    >
      <Identicon size={24} css={{ width: 24, height: 24 }} value={addressString} />
      <div css={({ color }) => ({ display: 'flex', gap: 4, marginTop: 4, whiteSpace: 'nowrap' })}>
        <p
          css={({ color }) => ({
            maxWidth: 80,
            color: color.lightGrey,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          })}
        >
          {account.meta.name}
        </p>{' '}
        <p css={({ color }) => ({ color: color.offWhite })}>({truncateMiddle(addressString, 4, 5, '...')})</p>
      </div>
    </div>
  )
}

const AccountSwitcher: React.FC<Props> = ({ accounts, onSelect, selectedAccount }) => {
  const [expanded, setExpanded] = useState(false)
  const { signIn } = useSignIn()
  const ref = useRef(null)
  const [query, setQuery] = useState('')
  const [accountToSignIn, setAccountToSignIn] = useState<InjectedAccount>()
  useOnClickOutside(ref.current, () => setExpanded(false))

  // cannot close if signing in
  const actualExpanded = expanded || accountToSignIn

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      const isSelectedAccount = selectedAccount?.address.isEqual(acc.address)
      const isQueryMatch =
        !query || `${acc.meta.name} ${acc.address.toSs58()}`.toLowerCase().includes(query.toLowerCase())
      return !isSelectedAccount && isQueryMatch
    })
  }, [query, accounts, selectedAccount])

  useEffect(() => {
    if (!actualExpanded && query.length > 0) setQuery('')
  }, [actualExpanded, query.length])

  const handleSelectAccount = async (account: InjectedAccount) => {
    setQuery('')
    setAccountToSignIn(account)
    try {
      await signIn(account)
    } catch (e) {
    } finally {
      setAccountToSignIn(undefined)
      setExpanded(false)
    }
  }

  if (!selectedAccount) return null

  return (
    <div ref={ref} css={{ position: 'relative', width: '100%' }}>
      <div
        css={({ color }) => ({
          'alignItems': 'center',
          'display': 'flex',
          'justifyContent': 'space-between',
          'background': color.surface,
          'borderRadius': 8,
          'border': `solid 1px ${actualExpanded ? color.border : 'rgba(0,0,0,0)'}`,
          'borderBottom': 'none',
          'width': '100%',
          'padding': '8px 12px',
          'cursor': 'pointer',
          ':hover': {
            div: { color: color.offWhite },
          },
        })}
        onClick={() => setExpanded(!expanded)}
      >
        <div css={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <Identicon size={40} value={selectedAccount.address.toSs58()} />
          <div
            className={css`
              width: 120px;
              @media ${device.md} {
                width: 160px;
              }
              p {
                line-height: 1;
                padding-top: 2px;
              }
            `}
          >
            <p
              css={({ color }) => ({
                whiteSpace: 'nowrap',
                overflowX: 'hidden',
                textOverflow: 'ellipsis',
                color: color.offWhite,
                marginBottom: 4,
              })}
            >
              {selectedAccount.meta.name ?? truncateMiddle(selectedAccount.address.toSs58(), 4, 6, '...')}
            </p>
            {selectedAccount.meta.name !== undefined && (
              <p css={({ color }) => ({ color: color.lightGrey })}>
                {truncateMiddle(selectedAccount.address.toSs58(), 4, 6, '...')}
              </p>
            )}
          </div>
        </div>
        <div
          css={({ color }) => ({
            height: 'max-content',
            lineHeight: 1,
            color: actualExpanded ? color.offWhite : color.lightGrey,
          })}
        >
          <ChevronVertical size={24} />
        </div>
      </div>
      <div
        css={({ color }) => ({
          position: 'absolute',
          top: '100%',
          // to cover the transition of bottom border radius
          marginTop: -8,
          paddingTop: 8,
          left: 0,
          backgroundColor: color.surface,
          borderRadius: '0px 0px 4px 4px',
          border: `solid 1px ${actualExpanded ? color.border : 'rgba(0,0,0,0)'}`,
          visibility: actualExpanded ? 'visible' : 'hidden',
          borderTop: 'none',
          width: '100%',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          // height is fixed when actualExpanded to leave enough space for loading indicator
          height: actualExpanded ? 188 : 0,
          overflow: 'hidden',
          transition: '0.2s ease-in-out',
        })}
      >
        {accountToSignIn ? (
          <div
            css={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <div css={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24 }}>
              <CircularProgressIndicator />
              <p css={({ color }) => ({ color: color.offWhite })}>Signing In</p>
            </div>
            <Identicon size={40} value={accountToSignIn.address.toSs58()} />
            <p css={({ color }) => ({ color: color.offWhite, marginTop: 8 })}>{accountToSignIn.meta.name}</p>
            <p>{truncateMiddle(accountToSignIn.address.toSs58(), 4, 6, '...')}</p>
          </div>
        ) : (
          <>
            <div
              css={({ foreground }) => ({
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                borderBottom: `rgba(${foreground}, 0.1) solid 1px`,
                padding: '0 12px',
                paddingTop: 8,
              })}
            >
              <Search />
              <input
                css={{ border: 'none', backgroundColor: 'transparent', width: '100%', padding: '16px 0px' }}
                placeholder="Search Account..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div css={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              {filteredAccounts.map(acc => (
                <AccountRow key={acc.address.toSs58()} account={acc} onSelect={handleSelectAccount} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AccountSwitcher