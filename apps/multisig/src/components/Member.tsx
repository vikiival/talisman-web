import { Chain } from '@domains/chains'
import { AugmentedAccount } from '@domains/multisig'
import { css } from '@emotion/css'
import { useTheme } from '@emotion/react'
import { ExternalLink, Trash } from '@talismn/icons'
import { IconButton, Identicon } from '@talismn/ui'
import { toSs52Address, toSubscanUrl } from '@util/addresses'
import truncateMiddle from 'truncate-middle'

export const Member = ({ m, chain, onDelete }: { m: AugmentedAccount; onDelete?: () => void; chain: Chain | null }) => {
  const theme = useTheme()

  const ss52Address = toSs52Address(m.address, chain) as string
  return (
    <div
      className={css`
        display: flex;
        align-items: center;
        background: ${m.you ? '0' : 'var(--color-backgroundSecondary)'};
        border: 1px solid var(--color-backgroundSecondary);
        border-radius: 8px;
        padding: 16px;
        gap: 8px;
      `}
    >
      <Identicon value={m.address} size={32} />
      <div css={{ display: 'grid', alignItems: 'center' }}>
        <div css={{ display: 'flex' }}>
          {m.nickname ? (
            <span>{m.nickname}</span>
          ) : (
            <span css={{ color: 'var(--color-offWhite)' }}>{truncateMiddle(ss52Address, 12, 13, '...')}</span>
          )}
          &nbsp;
          {m.you && <span css={{ color: 'var(--color-offWhite)' }}>(You)</span>}
        </div>
        {m.nickname ? <span css={{ fontSize: '12px' }}>{truncateMiddle(m.address, 4, 5, '...')}</span> : null}
      </div>
      <div css={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '8px' }}>
        {onDelete && (
          <IconButton size={16} contentColor={`rgb(${theme.foreground})`} onClick={onDelete}>
            <Trash size={16} />
          </IconButton>
        )}
        <a href={toSubscanUrl(m.address, chain)} target="_blank" rel="noreferrer">
          <IconButton size={16} contentColor={`rgb(${theme.foreground})`} css={{ cursor: 'pointer' }}>
            <ExternalLink size={16} />
          </IconButton>
        </a>
      </div>
    </div>
  )
}