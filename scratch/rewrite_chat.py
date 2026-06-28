import re

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove Chat.css import
    content = re.sub(r'import\s+"./Chat\.css";\n?', '', content)

    # Class mappings
    mappings = {
        r'\bchat-page\b': 'flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]',
        r'\bchat-shell\b': 'flex w-full h-full',
        r'\bchat-sidebar\b': 'w-80 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-color)]',
        r'\bchat-sidebar-header\b': 'p-4 flex items-center justify-between border-b border-[var(--border-color)]',
        r'\bchat-sidebar-title\b': 'text-lg font-semibold text-[var(--text-primary)]',
        r'\bchat-sidebar-count\b': 'text-xs bg-[var(--border-color)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full',
        r'\bchat-sidebar-tabs\b': 'flex p-2 gap-1 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]',
        
        # Need to handle dynamic classes
        r'\bchat-sidebar-tab\b': 'flex-1 py-1.5 text-sm font-medium rounded-md text-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors',
        
        r'\bchat-search\b': 'p-3 border-b border-[var(--border-color)] relative flex items-center bg-[var(--bg-secondary)]',
        r'\bchat-search-icon\b': 'w-4 h-4 absolute left-5 text-[var(--text-secondary)]',
        r'\bchat-search-input\b': 'w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors',
        r'\bchat-conversations\b': 'flex-1 overflow-y-auto',
        
        r'\bchat-convo\b': 'w-full flex items-start gap-3 p-3 border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)] transition-colors text-left',
        
        r'\bchat-convo-avatar\b': 'relative w-10 h-10 flex-shrink-0',
        r'\bchat-avatar\b': 'w-full h-full rounded-full object-cover border border-[var(--border-color)]',
        r'\bchat-online-dot\b': 'absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full',
        r'\bchat-convo-info\b': 'flex-1 min-w-0 flex flex-col justify-center',
        r'\bchat-convo-top\b': 'flex justify-between items-center mb-0.5',
        r'\bchat-convo-name\b': 'font-medium text-sm text-[var(--text-primary)] truncate',
        r'\bchat-convo-group-badge\b': 'text-[10px] bg-[var(--border-color)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded ml-2',
        r'\bchat-convo-time\b': 'text-[11px] text-[var(--text-secondary)] flex-shrink-0',
        r'\bchat-convo-snippet\b': 'text-xs text-[var(--text-secondary)] truncate',
        r'\bchat-empty-sidebar\b': 'p-6 text-center text-sm text-[var(--text-secondary)]',

        r'\bchat-thread\b': 'flex-1 flex flex-col min-w-0 bg-[var(--bg-primary)]',
        r'\bchat-thread-header\b': 'h-16 flex-shrink-0 px-6 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]',
        
        r'\bchat-group-header-info\b': 'flex items-center gap-4',
        r'\bchat-group-avatar-stack\b': 'flex -space-x-2',
        # Handle group avatar mapping, it is an img tag without a specific class in chat-group-avatar-stack, but wait, the img has no class. We'll add one via regex if needed, or just let CSS do it. Actually, inline classes are better.
        
        r'\bchat-group-name\b': 'font-semibold text-[var(--text-primary)] text-sm',
        r'\bchat-group-meta\b': 'text-xs text-[var(--text-secondary)] flex items-center gap-1',
        r'\bchat-members-toggle\b': 'p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors',
        
        r'\bchat-peer-info\b': 'flex items-center gap-3',
        r'\bchat-peer-avatar\b': 'w-10 h-10 rounded-full object-cover border border-[var(--border-color)]',
        r'\bchat-peer-name\b': 'font-semibold text-[var(--text-primary)] text-sm',
        r'\bchat-peer-status\b': 'text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5',
        r'\bchat-status-dot\b': 'w-2 h-2 rounded-full',
        
        r'\bchat-typing-indicator\b': 'flex gap-0.5 items-center',
        
        r'\bchat-github-mini\b': 'flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]',
        r'\bchat-github-link\b': 'hover:text-[var(--color-primary)] transition-colors',
        r'\bchat-github-muted\b': 'opacity-70',
        r'\bchat-github-events\b': 'flex gap-2',
        r'\bchat-github-event\b': 'bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)] truncate max-w-[120px]',
        r'\bchat-github-repos\b': 'flex gap-2',
        r'\bchat-github-repo\b': 'hover:text-[var(--color-primary)] underline decoration-[var(--border-color)] underline-offset-2 transition-colors truncate max-w-[100px]',
        
        r'\bchat-thread-with-panel\b': 'flex-1 flex min-h-0',
        r'\bchat-thread-main\b': 'flex-1 flex flex-col min-w-0',
        
        r'\bchat-messages\b': 'flex-1 overflow-y-auto p-6 space-y-6',
        r'\bchat-day-divider\b': 'flex justify-center my-6',
        r'\bchat-day-divider\s+span\b': 'text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]', # Wait, the span is nested. We'll handle this manually.
        
        r'\bchat-msg\b': 'flex flex-col gap-1 max-w-[85%]',
        r'\bchat-msg-avatar\b': 'w-8 h-8 rounded-full object-cover border border-[var(--border-color)] mt-auto',
        
        r'\bchat-msg-content\b': 'flex flex-col gap-1',
        r'\bchat-msg-sender-name\b': 'text-[11px] text-[var(--text-secondary)] ml-1',
        
        r'\bchat-edit-zone\b': 'flex flex-col gap-2 w-full max-w-md',
        r'\bchat-edit-input\b': 'w-full p-2 bg-[var(--bg-primary)] border border-[var(--color-primary)] rounded-md text-sm text-[var(--text-primary)] outline-none resize-none',
        r'\bchat-edit-actions\b': 'flex gap-2 justify-end',
        r'\bchat-edit-save\b': 'text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-md hover:brightness-110 transition-all',
        r'\bchat-edit-cancel\b': 'text-xs bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded-md hover:bg-[var(--border-color)] transition-all',
        
        r'\bchat-delete-confirm\b': 'flex flex-col gap-2 bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)]',
        r'\bchat-delete-actions\b': 'flex gap-2',
        r'\bchat-delete-yes\b': 'text-xs bg-red-500/10 text-red-500 hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-all',
        r'\bchat-delete-no\b': 'text-xs bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-color)] px-3 py-1.5 rounded-md hover:bg-[var(--border-color)] transition-all',
        
        r'\bchat-bubble\b': 'px-4 py-2.5 rounded-2xl text-sm relative group',
        r'\bchat-bubble-text\b': 'whitespace-pre-wrap break-words leading-relaxed',
        r'\bchat-markdown\b': 'prose prose-sm dark:prose-invert max-w-none',
        r'\bchat-edited-tag\b': 'text-[10px] opacity-60 ml-2 italic',
        
        r'\bchat-code-block-wrap\b': 'my-2 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[#282c34]',
        r'\bchat-code-header\b': 'flex items-center justify-between px-3 py-1.5 bg-black/20 border-b border-white/10',
        r'\bchat-code-lang\b': 'text-[10px] text-gray-400 font-mono uppercase',
        r'\bchat-code-copy\b': 'text-[10px] text-gray-400 hover:text-white transition-colors',
        r'\bchat-inline-code\b': 'font-mono text-[13px] bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[var(--text-primary)]',
        r'\bchat-md-link\b': 'text-[var(--color-primary)] hover:underline',
        
        r'\bchat-msg-meta\b': 'flex items-center gap-2 mt-1 text-[11px] text-[var(--text-secondary)]',
        r'\bchat-msg-time\b': '',
        r'\bchat-msg-status\b': '',
        r'\bchat-msg-retry\b': 'text-red-500 hover:underline cursor-pointer',
        
        r'\bchat-msg-hover-actions\b': 'absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-sm p-1',
        r'\bchat-hover-btn\b': 'p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] rounded',
        r'\bchat-hover-btn-danger\b': 'hover:text-red-500 hover:bg-red-500/10',
        
        r'\bchat-composer\b': 'p-4 border-t border-[var(--border-color)] bg-[var(--bg-primary)] flex items-end gap-3',
        r'\bchat-input-wrap\b': 'flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl relative focus-within:border-[var(--color-primary)] transition-colors',
        r'\bchat-input\b': 'w-full bg-transparent text-sm text-[var(--text-primary)] p-3 outline-none resize-none max-h-32 min-h-[44px]',
        r'\bchat-send-btn\b': 'w-11 h-11 flex-shrink-0 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        
        r'\bchat-members-panel\b': 'w-64 flex-shrink-0 flex flex-col bg-[var(--bg-secondary)] border-l border-[var(--border-color)] overflow-y-auto',
        r'\bchat-members-panel-header\b': 'p-4 border-b border-[var(--border-color)] text-sm font-semibold text-[var(--text-primary)]',
        r'\bchat-members-list\b': 'flex flex-col p-2 gap-1',
        r'\bchat-member-item\b': 'flex items-center gap-3 p-2 hover:bg-[var(--bg-primary)] rounded-md transition-colors',
        r'\bchat-member-avatar\b': 'w-8 h-8 rounded-full object-cover border border-[var(--border-color)]',
        r'\bchat-member-name\b': 'text-sm text-[var(--text-primary)] truncate flex-1',
        r'\bchat-member-role\b': 'text-[10px] bg-[var(--bg-primary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]',
    }

    # Complex replacements
    content = re.sub(r'className={`chat-sidebar-tab \${sidebarTab === \'direct\' \? \'active\' : \'\'}`}',
                     r'className={`flex-1 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${sidebarTab === \'direct\' ? \'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm\' : \'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]\'}`}', content)
    content = re.sub(r'className={`chat-sidebar-tab \${sidebarTab === \'projects\' \? \'active\' : \'\'}`}',
                     r'className={`flex-1 py-1.5 text-sm font-medium rounded-md text-center transition-colors ${sidebarTab === \'projects\' ? \'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm\' : \'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]\'}`}', content)

    content = re.sub(r'className={`chat-convo \${isActive \? "active" : ""}`}',
                     r'className={`w-full flex items-start gap-3 p-3 border-b border-[var(--border-color)] transition-colors text-left ${isActive ? \'bg-[var(--bg-primary)] border-l-2 border-l-[var(--color-primary)]\' : \'hover:bg-[var(--bg-primary)]\'}`}', content)
                     
    content = re.sub(r'className={`chat-members-toggle \${showMembersPanel \? \'active\' : \'\'}`}',
                     r'className={`p-2 rounded-md transition-colors ${showMembersPanel ? \'bg-[var(--bg-secondary)] text-[var(--text-primary)]\' : \'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]\'}`}', content)

    content = re.sub(r'className={`chat-status-dot \${isPeerTyping \? "typing" : "online"}`}',
                     r'className={`w-2 h-2 rounded-full ${isPeerTyping ? \'bg-[var(--color-primary)] animate-pulse\' : \'bg-green-500\'}`}', content)

    # Message styles
    content = re.sub(r'<div key={item.key} className={`chat-msg \${isMine \? "me" : "them"}`}>',
                     r'<div key={item.key} className={`flex max-w-[85%] gap-2 ${isMine ? "ml-auto flex-row-reverse" : ""}`}>', content)

    content = re.sub(r'<div className={`chat-bubble \${isMine \? \'me\' : \'them\'}`}>',
                     r'<div className={`px-4 py-2.5 rounded-2xl text-sm relative group ${isMine ? "bg-[var(--color-primary)] text-white rounded-tr-sm" : "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-sm"}`}>', content)
                     
    # Remove day divider span mapping, we will handle it directly
    content = re.sub(r'<div key={item.key} className="chat-day-divider"><span>{item.day}</span></div>',
                     r'<div key={item.key} className="flex justify-center my-6"><span className="text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-full border border-[var(--border-color)]">{item.day}</span></div>', content)

    content = re.sub(r'className="chat-typing-indicator">\s*<span></span><span></span><span></span>\s*</span>',
                     r'className="flex gap-0.5 items-center"><span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce"></span><span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.1s"}}></span><span className="w-1 h-1 bg-[var(--color-primary)] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span></span>', content)
                     
    # Add gap and class to msg-hover-actions
    content = re.sub(r'<div className="chat-msg-hover-actions">', r'<div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-sm p-1 z-10">', content)

    # General mappings
    for pattern, replacement in mappings.items():
        if replacement:
            content = re.sub(pattern, replacement, content)

    # Some images without specific classes
    content = re.sub(r'<img\s+key={member\._id}\s+src={member\.photoUrl\s+\|\|\s+defaultAvatar}\s+alt=""\s+onError={\(e\)\s+=>\s+{\s+e\.target\.src\s+=\s+defaultAvatar;\s+}}\s+/>',
                     r'<img key={member._id} src={member.photoUrl || defaultAvatar} alt="" className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] object-cover" onError={(e) => { e.target.src = defaultAvatar; }} />', content)


    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

process_file('scratch/Chat.jsx')
