import { Eye, List, Send, Settings, Share2, Users, Zap } from '@talismn/icons'
import { useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import NoVault from './CreateMultisig/NoVault'
import { EyeOfSauronProgressIndicator } from '@talismn/ui'
import { useRecoilValue } from 'recoil'
import { activeMultisigsState } from '@domains/multisig'
import { activeTeamsState } from '../domains/offchain-data'

export const Layout: React.FC<
  React.PropsWithChildren & { selected?: string; requiresMultisig?: boolean; hideSideBar?: boolean }
> = ({ children, selected, requiresMultisig, hideSideBar }) => {
  const multisigs = useRecoilValue(activeMultisigsState)
  const activeTeams = useRecoilValue(activeTeamsState)
  const navigate = useNavigate()

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
        gap: 16,
        padding: 24,
        flex: 1,
      }}
    >
      <Header />
      <div css={{ display: 'flex', flex: 1, gap: 16 }}>
        {requiresMultisig && (!activeTeams || multisigs.length === 0) ? (
          // loading multisigs from backend
          !activeTeams ? (
            <div css={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <EyeOfSauronProgressIndicator />
            </div>
          ) : (
            <div css={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%' }}>
              <NoVault />
            </div>
          )
        ) : (
          <>
            {!hideSideBar && (
              <Sidebar
                selected={selected}
                options={[
                  {
                    name: 'Overview',
                    icon: <Eye />,
                    onClick: () => navigate('/overview'),
                  },
                  {
                    name: 'Send',
                    icon: <Send />,
                    onClick: () => navigate('/send'),
                  },
                  {
                    name: 'Multi-send',
                    icon: <Share2 />,
                    onClick: () => navigate('/multisend'),
                  },
                  {
                    name: 'Voting',
                    icon: <Zap />,
                    onClick: () => navigate('/voting'),
                  },
                  {
                    name: 'Advanced',
                    icon: <List />,
                    onClick: () => navigate('/advanced'),
                  },
                  {
                    name: 'Address Book',
                    icon: <Users />,
                    onClick: () => navigate('/address-book'),
                  },
                  {
                    name: 'Settings',
                    icon: <Settings />,
                    onClick: () => navigate('/settings'),
                  },
                ]}
              />
            )}
            {children}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
