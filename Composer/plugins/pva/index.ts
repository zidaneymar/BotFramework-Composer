// plugin api
import composer from 'composer-api';

const ExtensionContributionPoint = (props) => {
  return <ExtensionContext.Provider>{props.children}</ExtensionContext.Provider>
}

function renderView(Component) {
  const container = document.createElement('div');

  ReactDOM.render(<ExtensionContributionPoint>{Component}</...>, container);
}

const MyComponent = () => {
  const extensionApi = useExtensionApi();

  // render json editor
  // on click "next", save json config
}

interface EventHandler {
  
}

interface ComposerPluginRegistration {
  
}

// called on activation event
export default async (composer: ComposerPluginRegistration): Promise<void> => {
  
  // register us as a publish provider
  composer.on('publish:target:select', 'pva', ({ renderView, onSubmit }) => {
    renderView(<MyComponent onSubmit={onSubmit} />);

    
    composer.registerPublishProvider(
      // 
    )
  });
}
